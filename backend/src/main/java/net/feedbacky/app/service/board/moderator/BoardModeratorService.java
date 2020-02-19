package net.feedbacky.app.service.board.moderator;

import java.util.List;

import net.feedbacky.app.rest.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.rest.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.rest.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.service.FeedbackyService;

import org.springframework.http.ResponseEntity;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
public interface BoardModeratorService extends FeedbackyService {

  List<FetchModeratorDto> getAll(String discriminator);

  List<FetchInviteDto> getAllInvited(String discriminator);

  FetchBoardDto postAccept(String code);

  ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto);

  ResponseEntity deleteInvitation(long id);

  ResponseEntity delete(String discriminator, long id);

}
