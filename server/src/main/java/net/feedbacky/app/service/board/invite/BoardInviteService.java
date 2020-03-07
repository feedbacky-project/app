package net.feedbacky.app.service.board.invite;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;
import net.feedbacky.app.rest.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.rest.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.rest.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.service.FeedbackyService;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
public interface BoardInviteService extends FeedbackyService {

  List<FetchSimpleUserDto> getAllInvited(String discriminator);

  List<FetchInviteDto> getAll(String discriminator);

  FetchBoardDto postAccept(String code);

  ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto);

  ResponseEntity delete(long id);

  ResponseEntity deleteInvited(String discriminator, long id);

}
