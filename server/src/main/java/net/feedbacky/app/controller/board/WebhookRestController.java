package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.webhook.FetchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PatchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PostWebhookDto;
import net.feedbacky.app.service.board.webhook.WebhookService;

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
 * Created at 12.12.2019
 */
@CrossOrigin
@RestController
public class WebhookRestController {

  private final WebhookService webhookService;

  @Autowired
  public WebhookRestController(WebhookService webhookService) {
    this.webhookService = webhookService;
  }

  @GetMapping("v1/boards/{discriminator}/webhooks")
  public List<FetchWebhookDto> getAll(@PathVariable String discriminator) {
    return webhookService.getAll(discriminator);
  }

  @PostMapping("v1/boards/{discriminator}/webhooks")
  public ResponseEntity<FetchWebhookDto> post(@PathVariable String discriminator, @Valid @RequestBody PostWebhookDto dto) {
    return webhookService.post(discriminator, dto);
  }

  @PatchMapping("v1/webhooks/{id}")
  public FetchWebhookDto patch(@PathVariable long id, @Valid @RequestBody PatchWebhookDto dto) {
    return webhookService.patch(id, dto);
  }

  @DeleteMapping("v1/webhooks/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return webhookService.delete(id);
  }

}
