package net.feedbacky.app.data.board.dto.social;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.base64.Base64;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.URL;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostSocialLinkDto {

  @Base64(maximumKbSize = 150, mimeType = {"image/png", "image/jpeg"}, message = "Icon must be a valid image with maximum size of 150kb.")
  private String iconData;
  @Length(min = 10, message = "Url must be valid URL link.")
  @URL(message = "Url must be valid URL link.")
  private String url;

}
