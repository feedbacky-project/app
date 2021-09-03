package net.feedbacky.app.data.idea.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.annotation.enumvalue.EnumValue;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 03.09.2021
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchVotersDto {

  @EnumValue(enumClazz = VotersClearType.class, message = "Field 'clearType' must be valid clear type.")
  private String clearType;

  public enum VotersClearType {
    ALL, ANONYMOUS
  }

}
