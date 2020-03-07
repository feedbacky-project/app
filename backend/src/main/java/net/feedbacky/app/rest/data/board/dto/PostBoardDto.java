package net.feedbacky.app.rest.data.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.alphanumeric.Alphanumeric;
import net.feedbacky.app.annotation.base64.Base64;
import net.feedbacky.app.annotation.hex.HexValue;
import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.utils.ImageUtils;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.ModelMapper;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;

/**
 * @author Plajer
 * <p>
 * Created at 09.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostBoardDto {

  private final Date creationDate = Calendar.getInstance().getTime();
  @NotNull(message = "Field 'name' cannot be null.")
  @Size(min = 4, max = 25, message = "Field 'name' must be longer than 4 and shorter than 25 characters.")
  private String name;
  @NotNull(message = "Field 'discriminator' cannot be null.")
  @Size(min = 3, max = 25, message = "Field 'discriminator' must be longer than 3 and shorter than 25 characters.")
  @Alphanumeric(message = "Field 'discriminator' must be alphanumeric text.")
  private String discriminator;
  @NotNull(message = "Field 'shortDescription' cannot be null.")
  @Size(min = 10, max = 50, message = "Field 'shortDescription' must be longer than 10 and shorter than 50 characters.")
  private String shortDescription;
  @NotNull(message = "Field 'fullDescription' cannot be null.")
  @Size(min = 10, max = 2500, message = "Field 'fullDescription' must be longer than 10 and shorter than 2500 characters.")
  private String fullDescription;
  @NotNull(message = "Field 'themeColor' cannot be null.")
  @HexValue(message = "Field 'themeColor' must be a valid Hex color value.")
  private String themeColor;
  @Base64(maximumKbSize = 250, mimeType = {"image/png", "image/jpeg"},
      message = "Field 'logo' must be a valid base64 encoded png image with maximum size of 250kb.", allowEmpty = true)
  private String logo;
  @Base64(maximumKbSize = 650, mimeType = {"image/png", "image/jpeg"},
      message = "Field 'banner' must be a valid base64 encoded png image with maximum size of 650kb.", allowEmpty = true)
  private String banner;

  public Board convertToEntity() {
    Board board = new ModelMapper().map(this, Board.class);
    //sanitize
    board.setFullDescription(StringEscapeUtils.escapeHtml4(board.getFullDescription()));
    board.setIdeas(new HashSet<>());
    board.setCreationDate(creationDate);
    board.setBanner(ImageUtils.DEFAULT_BANNER_URL);
    board.setLogo(ImageUtils.DEFAULT_LOGO_URL);
    return board;
  }

}
