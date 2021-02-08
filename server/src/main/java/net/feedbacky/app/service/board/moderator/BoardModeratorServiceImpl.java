package net.feedbacky.app.service.board.moderator;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.InvitationRepository;
import net.feedbacky.app.repository.board.ModeratorRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.RequestValidator;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
@Service
public class BoardModeratorServiceImpl implements BoardModeratorService {

  private final BoardRepository boardRepository;
  private final ModeratorRepository moderatorRepository;
  private final UserRepository userRepository;
  private final InvitationRepository invitationRepository;
  private final MailHandler mailHandler;

  @Autowired
  public BoardModeratorServiceImpl(BoardRepository boardRepository, ModeratorRepository moderatorRepository, UserRepository userRepository,
                                   InvitationRepository invitationRepository, MailHandler mailHandler) {
    this.boardRepository = boardRepository;
    this.moderatorRepository = moderatorRepository;
    this.userRepository = userRepository;
    this.invitationRepository = invitationRepository;
    this.mailHandler = mailHandler;
  }

  @Override
  public List<FetchInviteDto> getAllInvited(String discriminator) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphUtils.fromAttributePaths("invitedModerators"))
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to view invited moderators of this board.");
    }
    return board.getInvitedModerators().stream().map(invite -> new FetchInviteDto().from(invite)).collect(Collectors.toList());
  }

  @Override
  public FetchBoardDto postAccept(String code) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Invitation invitation = invitationRepository.findByCode(code)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid invitation link."));
    if(!invitation.getUser().equals(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invitation link belongs to someone else.");
    }
    Board board = invitation.getBoard();
    Moderator moderator = new Moderator();
    moderator.setUser(user);
    moderator.setBoard(board);
    moderator.setRole(Moderator.Role.MODERATOR);
    board.getModerators().add(moderator);
    boardRepository.save(board);
    invitationRepository.delete(invitation);
    return new FetchBoardDto().from(board);
  }

  @Override
  public ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to post moderators to this board.");
    }
    User eventUser = userRepository.findByEmail(dto.getUserEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User with email " + dto.getUserEmail() + " does not exist."));
    if(user.equals(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Inviting yourself huh?");
    }
    if(eventUser.isServiceStaff() || board.getModerators().stream().anyMatch(mod -> mod.getUser().equals(eventUser))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is moderator already.");
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
    return ResponseEntity.status(HttpStatus.CREATED).body(new FetchInviteDto().from(invitation));
  }

  @Override
  public ResponseEntity deleteInvitation(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Invitation invitation = invitationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation with id " + id + " does not exist."));
    if(!hasPermission(invitation.getBoard(), Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to delete moderator invitations from this board.");
    }
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
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to revoke moderator permissions from this board.");
    }
    User eventUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " does not exist."));
    Optional<Moderator> optional = board.getModerators().stream().filter(mod -> mod.getUser().equals(eventUser)).findFirst();
    if(!optional.isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "User with id " + id + " is not a moderator in this board.");
    }
    if(board.getCreator().equals(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "User with id " + id + " cannot be removed from this board.");
    }
    Moderator moderator = optional.get();
    board.getModerators().remove(moderator);
    boardRepository.save(board);
    new MailBuilder()
            .withRecipient(eventUser)
            .withEventBoard(board)
            .withTemplate(MailService.EmailTemplate.MODERATOR_KICKED)
            .sendMail(mailHandler.getMailService()).async();
    return ResponseEntity.noContent().build();
  }
}
