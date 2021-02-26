package net.feedbacky.app.service.board.suspended;

import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.board.dto.suspended.PostSuspendedUserDto;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 27.11.2020
 */
public interface BoardSuspendedUsersService {

  ResponseEntity<FetchSuspendedUserDto> post(String discriminator, PostSuspendedUserDto dto);

  ResponseEntity delete(long id);

}
