package net.feedbacky.app.data.idea.dto.attachment;

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

  @Base64(maximumKbSize = 600, mimeType = {"image/png", "image/jpeg"}, message = "Attachment must be a valid image with maximum size of 600kb.")
  private String data;

}
