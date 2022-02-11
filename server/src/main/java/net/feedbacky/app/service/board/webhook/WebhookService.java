package net.feedbacky.app.service.board.webhook;

import net.feedbacky.app.data.board.dto.webhook.FetchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PatchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PostWebhookDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
public interface WebhookService {

  List<FetchWebhookDto> getAll(String discriminator);

  ResponseEntity<FetchWebhookDto> post(String discriminator, PostWebhookDto dto);

  FetchWebhookDto patch(long id, PatchWebhookDto dto);

  ResponseEntity delete(long id);

}
