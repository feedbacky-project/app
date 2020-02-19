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

import net.feedbacky.app.rest.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.rest.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.service.board.social.BoardSocialLinksService;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@RestController
@CrossOrigin
public class BoardSocialLinksRestController {

  @Autowired private BoardSocialLinksService socialLinksService;

  @GetMapping("v1/boards/{discriminator}/socialLinks")
  public List<FetchSocialLinkDto> getAll(@PathVariable String discriminator) {
    return socialLinksService.getAll(discriminator);
  }

  @PostMapping("v1/boards/{discriminator}/socialLinks")
  public ResponseEntity<FetchSocialLinkDto> post(@PathVariable String discriminator, @Valid @RequestBody PostSocialLinkDto dto) {
    return socialLinksService.post(discriminator, dto);
  }

  @DeleteMapping("v1/socialLinks/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return socialLinksService.delete(id);
  }

}
