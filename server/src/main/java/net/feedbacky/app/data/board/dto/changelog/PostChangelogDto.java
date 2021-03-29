package net.feedbacky.app.data.board.dto.changelog;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;
import org.modelmapper.ModelMapper;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostChangelogDto {

  @NotNull(message = "Title cannot be empty.")
  @Length(min = 10, max = 70, message = "Title cannot be shorter than 10 or longer than 70 characters.")
  private String title;
  @NotNull(message = "Description cannot be empty.")
  @Length(min = 20, max = 1800, message = "Description cannot be shorter than 20 or longer than 1800 characters.")
  private String description;

  public Changelog convertToEntity(Board board) {
    Changelog changelog = new ModelMapper().map(this, Changelog.class);
    changelog.setEdited(false);
    changelog.setBoard(board);
    return changelog;
  }

}
