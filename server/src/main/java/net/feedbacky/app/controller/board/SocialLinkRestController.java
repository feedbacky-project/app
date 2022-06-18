package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.service.board.social.SocialLinkService;

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
 * Created at 23.12.2019
 */
@RestController
@CrossOrigin
public class SocialLinkRestController {

  private final SocialLinkService socialLinksService;

  @Autowired
  public SocialLinkRestController(SocialLinkService socialLinksService) {
    this.socialLinksService = socialLinksService;
  }

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
