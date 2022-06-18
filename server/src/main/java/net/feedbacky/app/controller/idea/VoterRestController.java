package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.idea.dto.PatchVotersDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.idea.voter.VoterService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
@CrossOrigin
@RestController
public class VoterRestController {

  private final VoterService voterService;

  @Autowired
  public VoterRestController(VoterService voterService) {
    this.voterService = voterService;
  }

  @GetMapping("v1/ideas/{id}/voters")
  public List<FetchSimpleUserDto> getAllVoters(@PathVariable long id) {
    return voterService.getAllVoters(id);
  }

  @PatchMapping("v1/ideas/{id}/voters")
  public List<FetchSimpleUserDto> patchVoters(@PathVariable long id, @Valid @RequestBody PatchVotersDto dto) {
    return voterService.patchVoters(id, dto);
  }

  @PostMapping("v1/ideas/{id}/voters")
  public FetchUserDto postUpvote(@PathVariable long id, @RequestHeader(value = "X-Feedbacky-Anonymous-Id", required = false) String anonymousId) {
    return voterService.postUpvote(id, anonymousId);
  }

  @DeleteMapping("v1/ideas/{id}/voters")
  public ResponseEntity deleteUpvote(@PathVariable long id, @RequestHeader(value = "X-Feedbacky-Anonymous-Id", required = false) String anonymousId) {
    return voterService.deleteUpvote(id, anonymousId);
  }


}
