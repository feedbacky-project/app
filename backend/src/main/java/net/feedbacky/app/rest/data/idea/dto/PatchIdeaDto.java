package net.feedbacky.app.rest.data.idea.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.validator.constraints.Length;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchIdeaDto {

  @Length(min = 10, max = 50, message = "Field 'title' cannot be shorter than 10 or longer than 50 characters.")
  private String title;
  @Length(min = 20, max = 1800, message = "Field 'description' cannot be shorter than 20 or longer than 1800 characters.")
  private String description;
  private Boolean open;

}
