package net.feedbacky.app.data.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.hex.HexValue;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;

/**
 * @author Plajer
 * <p>
 * Created at 13.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchTagDto {

  @Length(min = 3, max = 20, message = "Tag name cannot be shorter than 3 or longer than 20 characters.")
  private String name;
  @HexValue(message = "Color must be a valid Hex value.")
  private String color;
  private Boolean roadmapIgnored;
  private Boolean publicUse;

}
