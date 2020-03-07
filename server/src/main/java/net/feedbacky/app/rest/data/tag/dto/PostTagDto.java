package net.feedbacky.app.rest.data.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.hex.HexValue;
import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.tag.Tag;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;
import org.modelmapper.ModelMapper;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 13.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostTagDto {

  @NotNull(message = "Field 'name' cannot be null.")
  @Length(min = 3, max = 20, message = "Field 'name' cannot be shorter than 3 or longer than 20 characters.")
  private String name;
  @NotNull(message = "Field 'color' cannot be null.")
  @HexValue(allowEmpty = true, message = "Field 'color' must be a valid Hex color value.")
  private String color;

  public Tag convertToEntity(Board board) {
    Tag tag = new ModelMapper().map(this, Tag.class);
    tag.setBoard(board);
    return tag;
  }

}
