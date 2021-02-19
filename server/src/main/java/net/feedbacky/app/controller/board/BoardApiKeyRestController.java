package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.service.board.apikey.ApiKeyService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@RestController
@CrossOrigin
public class BoardApiKeyRestController {

  private final ApiKeyService apiKeyService;

  @Autowired
  public BoardApiKeyRestController(ApiKeyService apiKeyService) {
    this.apiKeyService = apiKeyService;
  }

  @PatchMapping("v1/boards/{discriminator}/apiKey")
  public ResponseEntity<FetchBoardDto> patch(@PathVariable String discriminator) {
    return apiKeyService.patch(discriminator);
  }

  @DeleteMapping("v1/boards/{discriminator}/apiKey")
  public ResponseEntity delete(@PathVariable String discriminator) {
    return apiKeyService.delete(discriminator);
  }

}
