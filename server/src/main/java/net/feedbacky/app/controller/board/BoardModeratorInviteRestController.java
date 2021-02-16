package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.invite.FetchInviteDto;
import net.feedbacky.app.data.board.dto.invite.PostInviteDto;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.moderator.PatchModeratorDto;
import net.feedbacky.app.service.board.moderator.BoardModeratorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 03.12.2019
 */
@CrossOrigin
@RestController
public class BoardModeratorInviteRestController {

  private final BoardModeratorService boardModeratorService;

  @Autowired
  public BoardModeratorInviteRestController(BoardModeratorService boardModeratorService) {
    this.boardModeratorService = boardModeratorService;
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

  @PatchMapping("v1/boards/{discriminator}/moderators")
  public FetchModeratorDto patch(@PathVariable String discriminator, @RequestBody @Valid PatchModeratorDto dto) {
    return boardModeratorService.patch(discriminator, dto);
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
