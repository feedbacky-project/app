package net.feedbacky.app.data.board.dto.webhook;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.board.webhook.Webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.URL;

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
public class PatchWebhookDto {

  @URL(message = "Url must be valid URL.")
  private String url;
  @EnumValue(enumClazz = Webhook.Type.class, message = "Type must be valid webhook type.")
  private String type;
  @NotNull(message = "Events cannot be empty.")
  private List<String> triggers;

}
