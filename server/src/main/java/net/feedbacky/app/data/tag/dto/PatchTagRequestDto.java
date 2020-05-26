package net.feedbacky.app.data.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 16.11.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchTagRequestDto {

  @Length(min = 3, max = 20, message = "Tag name cannot be shorter than 3 or longer than 20 characters.")
  private String name;
  @NotNull(message = "Specify if tag should be applied or removed.")
  private Boolean apply;

}
