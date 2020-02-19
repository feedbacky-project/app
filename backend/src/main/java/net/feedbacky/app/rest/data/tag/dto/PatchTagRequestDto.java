package net.feedbacky.app.rest.data.tag.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.validator.constraints.Length;

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

  @Length(min = 3, max = 20, message = "Field 'name' cannot be shorter than 3 or longer than 20 characters.")
  private String name;
  @NotNull(message = "Field 'apply' cannot be null.")
  private Boolean apply;

}
