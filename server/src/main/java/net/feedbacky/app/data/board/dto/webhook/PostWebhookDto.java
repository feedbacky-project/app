package net.feedbacky.app.data.board.dto.webhook;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.exception.FeedbackyRestException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.URL;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;

import javax.validation.constraints.NotNull;

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
  @NotNull(message = "Events cannot be empty.")
  private List<String> events;

  public Webhook convertToEntity(Board board) {
    for (String event : events) {
      try {
        Webhook.Event.valueOf(event);
      } catch (Exception ex) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid webhook event '" + event + "'.");
      }
    }
    Webhook webhook = new ModelMapper().map(this, Webhook.class);
    webhook.setBoard(board);
    return webhook;
  }

}
