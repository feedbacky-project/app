package net.feedbacky.app.rest.data.idea.dto.attachment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.annotation.base64.Base64;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostAttachmentDto {

  @Base64(maximumKbSize = 600, mimeType = {"image/png", "image/jpeg"},
      message = "Field 'data' must be a valid base64 encoded png image with maximum size of 600kb.")
  private String data;

}
