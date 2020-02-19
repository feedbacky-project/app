package net.feedbacky.app.rest.data.board.dto.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import net.feedbacky.app.annotation.enumvalue.EnumValue;

import org.hibernate.validator.constraints.URL;

import net.feedbacky.app.rest.data.board.webhook.Webhook;

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

  @URL(message = "Field 'url' must be valid URL.")
  private String url;
  @EnumValue(enumClazz = Webhook.Type.class, message = "Field 'type' must be valid webhook type.")
  private String type;
  private List<String> events;

}
