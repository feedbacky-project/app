package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.board.dto.suspended.PostSuspendedUserDto;
import net.feedbacky.app.service.board.suspended.BoardSuspendedUsersServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 27.11.2020
 */
@RestController
@CrossOrigin
public class BoardSuspendedUsersRestController {

  private final BoardSuspendedUsersServiceImpl boardSuspendedUsersService;

  @Autowired
  public BoardSuspendedUsersRestController(BoardSuspendedUsersServiceImpl boardSuspendedUsersService) {
    this.boardSuspendedUsersService = boardSuspendedUsersService;
  }

  @GetMapping("v1/boards/{discriminator}/suspendedUsers")
  public List<FetchSuspendedUserDto> getAll(@PathVariable String discriminator) {
    return boardSuspendedUsersService.getAll(discriminator);
  }

  @PostMapping("v1/boards/{discriminator}/suspendedUsers")
  public ResponseEntity<FetchSuspendedUserDto> post(@PathVariable String discriminator, @Valid @RequestBody PostSuspendedUserDto dto) {
    return boardSuspendedUsersService.post(discriminator, dto);
  }

  @DeleteMapping("v1/suspendedUsers/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return boardSuspendedUsersService.delete(id);
  }

}
