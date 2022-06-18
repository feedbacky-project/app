package net.feedbacky.app.data.board.dto.webhook;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.exception.FeedbackyRestException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.URL;
import org.springframework.http.HttpStatus;

import javax.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostWebhookDto {

  @URL(message = "Url must be valid URL.")
  @NotNull(message = "Url cannot be empty.")
  private String url;
  @EnumValue(enumClazz = Webhook.Type.class, message = "Type must be valid webhook type.")
  @NotNull(message = "Type cannot be empty.")
  private String type;
  @NotNull(message = "Triggers cannot be empty.")
  private List<String> triggers;

  public Webhook convertToEntity(Board board) {
    List<ActionTrigger.Trigger> webhookTriggers = new ArrayList<>();
    for(String event : triggers) {
      try {
        webhookTriggers.add(ActionTrigger.Trigger.valueOf(event));
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid trigger event '" + event + "'.");
      }
    }
    Webhook webhook = new Webhook();
    webhook.setUrl(url);
    webhook.setType(Webhook.Type.valueOf(type));
    webhook.setTriggers(webhookTriggers);
    webhook.setBoard(board);
    return webhook;
  }

}
