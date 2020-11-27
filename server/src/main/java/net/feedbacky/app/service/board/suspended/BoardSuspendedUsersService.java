package net.feedbacky.app.service.board.suspended;

import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.board.dto.suspended.PostSuspendedUserDto;
import net.feedbacky.app.service.FeedbackyService;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 27.11.2020
 */
public interface BoardSuspendedUsersService extends FeedbackyService {

  List<FetchSuspendedUserDto> getAll(String discriminator);

  ResponseEntity<FetchSuspendedUserDto> post(String discriminator, PostSuspendedUserDto dto);

  ResponseEntity delete(long id);

}
