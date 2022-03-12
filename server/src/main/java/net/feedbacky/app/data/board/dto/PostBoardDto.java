package net.feedbacky.app.data.board.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.alphanumeric.Alphanumeric;
import net.feedbacky.app.annotation.base64.Base64;
import net.feedbacky.app.annotation.hex.HexValue;
import net.feedbacky.app.data.board.Board;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
  @NotNull(message = "Board name cannot be empty.")
  @Size(min = 4, max = 25, message = "Board name must be longer than 4 and shorter than 25 characters.")
  private String name;
  @NotNull(message = "Board discriminator cannot be empty.")
  @Size(min = 3, max = 25, message = "Board discriminator must be longer than 3 and shorter than 25 characters.")
  @Alphanumeric(message = "Board discriminator must be alphanumeric text.")
  private String discriminator;
  @NotNull(message = "Short description cannot be empty.")
  @Size(min = 10, max = 50, message = "Short description must be longer than 10 and shorter than 50 characters.")
  private String shortDescription;
  @NotNull(message = "Full description cannot be null.")
  @Size(min = 10, max = 2500, message = "Full description must be longer than 10 and shorter than 2500 characters.")
  private String fullDescription;
  @NotNull(message = "Theme cannot be empty.")
  @HexValue(message = "Theme must be a valid Hex value.")
  private String themeColor;
  @Base64(maximumKbSize = 250, mimeType = {"image/png", "image/jpeg"}, message = "Logo must be a valid image with maximum size of 250kb.", allowEmpty = true)
  private String logo;
  @Base64(maximumKbSize = 650, mimeType = {"image/png", "image/jpeg"}, message = "Banner must be a valid image with maximum size of 650kb.", allowEmpty = true)
  private String banner;

  //ommits logo and banner fields because they must be urls
  public Board convertToEntity() {
    Board board = new Board();
    board.setName(name);
    board.setDiscriminator(discriminator);
    board.setShortDescription(shortDescription);
    board.setFullDescription(fullDescription);
    board.setThemeColor(themeColor);
    board.setIdeas(new HashSet<>());
    board.setCreationDate(creationDate);
    return board;
  }
}
