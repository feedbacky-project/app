package net.feedbacky.app.data.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.base64.Base64;
import net.feedbacky.app.annotation.hex.HexValue;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.Size;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchBoardDto {

  @Size(min = 4, max = 25, message = "Field 'name' must be longer than 4 and shorter than 25 characters.")
  private String name;
  @Size(min = 10, max = 50, message = "Field 'shortDescription' must be longer than 10 and shorter than 50 characters.")
  private String shortDescription;
  @Size(min = 10, max = 2500, message = "Field 'fullDescription' must be longer than 10 and shorter than 2500 characters.")
  private String fullDescription;

  @HexValue(allowEmpty = true, message = "Field 'themeColor' must be a valid Hex color value.")
  private String themeColor;
  @Base64(maximumKbSize = 250, mimeType = {"image/png", "image/jpeg"},
      message = "Field 'logo' must be a valid base64 encoded png image with maximum size of 250kb.", allowEmpty = true)
  private String logo;
  @Base64(maximumKbSize = 650, mimeType = {"image/png", "image/jpeg"},
      message = "Field 'banner' must be a valid base64 encoded png image with maximum size of 650kb.", allowEmpty = true)
  private String banner;
  private Boolean privatePage;

}
