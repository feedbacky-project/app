package net.feedbacky.app.data.board.dto.changelog;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.Size;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchChangelogDto {

  @Size(min = 10, max = 70, message = "Name must be longer than 10 and shorter than 70 characters.")
  private String title;
  @Size(min = 20, max = 1800, message = "Short description must be longer than 20 and shorter than 1800 characters.")
  private String description;

}
