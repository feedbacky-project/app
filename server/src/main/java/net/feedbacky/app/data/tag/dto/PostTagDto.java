package net.feedbacky.app.data.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.hex.HexValue;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.tag.Tag;

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

  @NotNull(message = "Tag name cannot be empty.")
  @Length(min = 3, max = 20, message = "Tag name cannot be shorter than 3 or longer than 20 characters.")
  private String name;
  @NotNull(message = "Color cannot be empty.")
  @HexValue(allowEmpty = true, message = "Color must be a valid Hex value.")
  private String color;
  @NotNull(message = "Please specify if tag should be ignored in roadmap.")
  private Boolean roadmapIgnored;
  @NotNull(message = "Please specify if tag can be used publicly.")
  private Boolean publicUse;

  public Tag convertToEntity(Board board) {
    Tag tag = new ModelMapper().map(this, Tag.class);
    tag.setBoard(board);
    return tag;
  }

}
