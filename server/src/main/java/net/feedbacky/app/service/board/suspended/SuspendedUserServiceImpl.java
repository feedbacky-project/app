package net.feedbacky.app.service.board.suspended;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.board.dto.suspended.PostSuspendedUserDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.SuspendedUserRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 27.11.2020
 */
@Service
public class SuspendedUserServiceImpl implements SuspendedUserService {

  private final BoardRepository boardRepository;
  private final SuspendedUserRepository suspendedUserRepository;
  private final UserRepository userRepository;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  public SuspendedUserServiceImpl(BoardRepository boardRepository, SuspendedUserRepository suspendedUserRepository,
                                  UserRepository userRepository, TriggerExecutor triggerExecutor) {
    this.boardRepository = boardRepository;
    this.suspendedUserRepository = suspendedUserRepository;
    this.userRepository = userRepository;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public ResponseEntity<FetchSuspendedUserDto> post(String discriminator, PostSuspendedUserDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    Optional<Boolean> isSuspended = board.getSuspensedList().stream().map(suspended -> suspended.getUser().getId() == dto.getUserId()).findAny();
    if(isSuspended.isPresent() && isSuspended.get()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user is already suspended.");
    }
    User targetUser = userRepository.findById(dto.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("User with id {0} not found.", dto.getUserId())));
    if(targetUser.isServiceStaff() || board.getCreator().equals(targetUser) || board.getModerators().stream().anyMatch(mod -> mod.getUser().equals(targetUser))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "This user cannot be suspended.");
    }
    SuspendedUser suspendedUser = dto.convertToEntity(targetUser, board);
    suspendedUser = suspendedUserRepository.save(suspendedUser);
    board.getSuspensedList().add(suspendedUser);
    boardRepository.save(board);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_USER_SUSPENSION)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board, suspendedUser)
            .build()
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(suspendedUser.toDto());
  }

  @Override
  public ResponseEntity delete(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    SuspendedUser suspendedUser = suspendedUserRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Suspended user with id {0} not found.", id)));
    Board board = suspendedUser.getBoard();
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    board.getSuspensedList().remove(suspendedUser);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_USER_UNSUSPENSION)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board, suspendedUser)
            .build()
    );
    suspendedUserRepository.delete(suspendedUser);
    boardRepository.save(board);
    return ResponseEntity.noContent().build();
  }
}
