package net.feedbacky.app.rest.controllers.board;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;
import net.feedbacky.app.rest.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.rest.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.rest.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.service.board.moderator.BoardModeratorService;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
@CrossOrigin
@RestController
public class BoardModeratorInviteRestController {

  @Autowired private BoardModeratorService boardModeratorService;

  @GetMapping("v1/boards/{discriminator}/moderators")
  public List<FetchModeratorDto> getAll(@PathVariable String discriminator) {
    return boardModeratorService.getAll(discriminator);
  }

  @GetMapping("v1/boards/{discriminator}/invitedModerators")
  public List<FetchInviteDto> getAllInvited(@PathVariable String discriminator) {
    return boardModeratorService.getAllInvited(discriminator);
  }

  @PostMapping("v1/moderatorInvitations/{code}/accept")
  public FetchBoardDto postAccept(@PathVariable String code) {
    return boardModeratorService.postAccept(code);
  }

  @PostMapping("v1/boards/{discriminator}/moderators")
  public ResponseEntity<FetchInviteDto> post(@PathVariable String discriminator, @RequestBody @Valid PostInviteDto dto) {
    return boardModeratorService.post(discriminator, dto);
  }

  @DeleteMapping("v1/boards/{discriminator}/moderators/{id}")
  public ResponseEntity delete(@PathVariable String discriminator, @PathVariable long id) {
    return boardModeratorService.delete(discriminator, id);
  }

  @DeleteMapping("v1/moderatorInvitations/{id}")
  public ResponseEntity deleteInvitation(@PathVariable long id) {
    return boardModeratorService.deleteInvitation(id);
  }

}
