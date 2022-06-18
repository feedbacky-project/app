package net.feedbacky.app.service.board.moderator;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.moderator.PatchModeratorDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.InvitationRepository;
import net.feedbacky.app.repository.board.ModeratorRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
@Service
public class ModeratorServiceImpl implements ModeratorService {

  private final BoardRepository boardRepository;
  private final ModeratorRepository moderatorRepository;
  private final UserRepository userRepository;
  private final InvitationRepository invitationRepository;
  private final MailHandler mailHandler;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  public ModeratorServiceImpl(BoardRepository boardRepository, ModeratorRepository moderatorRepository, UserRepository userRepository,
                              InvitationRepository invitationRepository, MailHandler mailHandler, TriggerExecutor triggerExecutor) {
    this.boardRepository = boardRepository;
    this.moderatorRepository = moderatorRepository;
    this.userRepository = userRepository;
    this.invitationRepository = invitationRepository;
    this.mailHandler = mailHandler;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public List<FetchInviteDto> getAllInvited(String discriminator) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphUtils.fromAttributePaths("invitedModerators"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    return board.getInvitedModerators().stream().map(Invitation::toDto).collect(Collectors.toList());
  }

  @Override
  public FetchBoardDto postAccept(String code) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Invitation invitation = invitationRepository.findByCode(code)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation link."));
    if(!invitation.getUser().equals(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid invitation link.");
    }
    Board board = invitation.getBoard();
    Moderator moderator = new Moderator();
    moderator.setUser(user);
    moderator.setBoard(board);
    moderator.setRole(Moderator.Role.MODERATOR);
    board.getModerators().add(moderator);
    board = boardRepository.save(board);
    invitationRepository.delete(invitation);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_MODERATOR_ADDED)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board, moderator)
            .build()
    );
    return board.toDto();
  }

  @Override
  public ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    User eventUser = userRepository.findByEmail(dto.getUserEmail())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("User with email {0} not found.", dto.getUserEmail())));
    if(user.equals(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Inviting yourself huh?");
    }
    if(eventUser.isServiceStaff() || board.getModerators().stream().anyMatch(mod -> mod.getUser().equals(eventUser))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is already a moderator.");
    }
    if(board.getInvitedModerators().stream().anyMatch(invite -> invite.getUser().equals(eventUser))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is already invited.");
    }
    Invitation invitation = dto.convertToEntity(eventUser, board, "mod");
    board.getInvitedModerators().add(invitation);
    invitationRepository.save(invitation);
    new MailBuilder()
            .withRecipient(eventUser)
            .withEventBoard(board)
            .withInvitation(invitation)
            .withTemplate(MailService.EmailTemplate.MODERATOR_INVITATION)
            .sendMail(mailHandler.getMailService()).async();
    return ResponseEntity.status(HttpStatus.CREATED).body(invitation.toDto());
  }

  @Override
  public FetchModeratorDto patch(String discriminator, PatchModeratorDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.OWNER, user);
    List<Moderator> moderators = moderatorRepository.findByBoard(board);
    Optional<Moderator> optional = moderators.stream().filter(mod -> mod.getUser().getId() == dto.getUserId()).findFirst();
    if(!optional.isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Moderator with id {0} not found.", dto.getUserId()));
    }
    Moderator moderator = optional.get();
    //promoted to higher role, else demoted
    if(moderator.getRole().getId() > Moderator.Role.valueOf(dto.getRole().toUpperCase()).getId()) {
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(ActionTrigger.Trigger.BOARD_MODERATOR_PROMOTED)
              .withBoard(board)
              .withTriggerer(user)
              .withRelatedObjects(board, moderator)
              .build()
      );
    } else {
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(ActionTrigger.Trigger.BOARD_MODERATOR_DEMOTED)
              .withBoard(board)
              .withTriggerer(user)
              .withRelatedObjects(board, moderator)
              .build()
      );
    }
    moderator.setRole(Moderator.Role.valueOf(dto.getRole().toUpperCase()));
    moderator = moderatorRepository.save(moderator);
    return moderator.toDto();
  }

  @Override
  public ResponseEntity deleteInvitation(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Invitation invitation = invitationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Invitation with id {0} not found.", id)));
    ServiceValidator.isPermitted(invitation.getBoard(), Moderator.Role.ADMINISTRATOR, user);
    Board board = invitation.getBoard();
    if(!board.getInvitedModerators().contains(invitation)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invitation with id " + id + " does not belong to this board.");
    }
    board.getInvitedModerators().remove(invitation);
    boardRepository.save(board);
    invitationRepository.delete(invitation);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity delete(String discriminator, long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    User eventUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("User with id {0} not found.", id)));
    Optional<Moderator> optional = board.getModerators().stream().filter(mod -> mod.getUser().equals(eventUser)).findFirst();
    if(!optional.isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is not a moderator.");
    }
    if(board.getCreator().equals(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user's permissions can't be revoked.");
    }
    if(ServiceValidator.hasPermission(board, Moderator.Role.ADMINISTRATOR, user) && ServiceValidator.hasPermission(board, Moderator.Role.ADMINISTRATOR, eventUser)) {
      throw new InsufficientPermissionsException("Insufficient permissions, same permission type.");
    }
    Moderator moderator = optional.get();
    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_MODERATOR_REMOVED)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board, moderator)
            .build()
    );
    board.getModerators().remove(moderator);
    moderator.setBoard(null);
    moderatorRepository.deleteInBatch(Collections.singletonList(moderator));
    new MailBuilder()
            .withRecipient(eventUser)
            .withEventBoard(board)
            .withTemplate(MailService.EmailTemplate.MODERATOR_KICKED)
            .sendMail(mailHandler.getMailService()).async();
    return ResponseEntity.noContent().build();
  }
}
