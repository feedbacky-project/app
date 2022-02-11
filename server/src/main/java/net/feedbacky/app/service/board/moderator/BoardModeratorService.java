package net.feedbacky.app.service.board.moderator;

import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.moderator.PatchModeratorDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
public interface BoardModeratorService {

  List<FetchInviteDto> getAllInvited(String discriminator);

  FetchBoardDto postAccept(String code);

  ResponseEntity<FetchInviteDto> post(String discriminator, PostInviteDto dto);

  FetchModeratorDto patch(String discriminator, PatchModeratorDto dto);

  ResponseEntity deleteInvitation(long id);

  ResponseEntity delete(String discriminator, long id);

}
