package net.feedbacky.app.rest.data.tag.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import net.feedbacky.app.annotation.hex.HexValue;

import org.hibernate.validator.constraints.Length;
import org.modelmapper.ModelMapper;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.tag.Tag;

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
