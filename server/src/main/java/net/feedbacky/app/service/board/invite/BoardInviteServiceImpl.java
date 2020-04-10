package net.feedbacky.app.service.board.invite;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.InvitationRepository;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.RequestValidator;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailPlaceholderParser;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Service
public class BoardInviteServiceImpl implements BoardInviteService {

  private BoardRepository boardRepository;
  private UserRepository userRepository;
  private InvitationRepository invitationRepository;
  private MailHandler mailHandler;

  @Autowired
  public BoardInviteServiceImpl(BoardRepository boardRepository, UserRepository userRepository, InvitationRepository invitationRepository, MailHandler mailHandler) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.invitationRepository = invitationRepository;
    this.mailHandler = mailHandler;
  }

  @Override
  public List<FetchSimpleUserDto> getAllInvited(String discriminator) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to view invited users of this board.");
    }
    return board.getInvitedUsers().stream().map(usr -> usr.convertToDto().exposeSensitiveData(false).convertToSimpleDto()).collect(Collectors.toList());
  }

  @Override
  public List<FetchInviteDto> getAll(String discriminator) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to view invitations of this board.");
    }
    return invitationRepository.findByBoard(board).stream().map(Invitation::convertToDto).collect(Collectors.toList());
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
    board.getInvitedUsers().add(user);
    boardRepository.save(board);
    invitationRepository.delete(invitation);
    return board.convertToDto().ensureViewExplicit();
  }

  @Override
  public ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to post invitations to this board.");
    }
    User eventUser = userRepository.findByEmail(dto.getUserEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User with email " + dto.getUserEmail() + " does not exist."));
    if(board.getInvitedUsers().contains(eventUser) || invitationRepository.findByBoardAndUser(board, user).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is already invited to this board.");
    }
    if(user.equals(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Inviting yourself huh?");
    }
    if(eventUser.isServiceStaff() || board.getModerators().stream().anyMatch(mod -> mod.getUser().equals(eventUser))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user can see your board already.");
    }
    Invitation invitation = dto.convertToEntity(eventUser, board);
    board.getInvitations().add(invitation);
    invitationRepository.save(invitation);
    CompletableFuture.runAsync(() -> {
      MailService.EmailTemplate template = MailService.EmailTemplate.BOARD_INVITATION;
      String subject = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getSubject(), template, board, user, invitation);
      String text = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getLegacyText(), template, board, user, invitation);
      String html = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getHtml(), template, board, user, invitation);
      mailHandler.getMailService().send(dto.getUserEmail(), subject, text, html);
    });
    return ResponseEntity.status(HttpStatus.CREATED).body(invitation.convertToDto());
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Invitation invitation = invitationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation with id " + id + " does not exist."));
    if(!hasPermission(invitation.getBoard(), Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to delete invitations from this board.");
    }
    Board board = invitation.getBoard();
    if(!board.getInvitations().contains(invitation)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invitation with id " + id + " does not belong to this board.");
    }
    board.getInvitations().remove(invitation);
    boardRepository.save(board);
    invitationRepository.delete(invitation);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deleteInvited(String discriminator, long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to delete invited users from this board.");
    }
    User eventUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " does not exist."));
    if(!board.getInvitedUsers().contains(eventUser)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "User with id " + id + " does not belong to this board.");
    }
    board.getInvitedUsers().remove(eventUser);
    boardRepository.save(board);
    return ResponseEntity.noContent().build();
  }
}
