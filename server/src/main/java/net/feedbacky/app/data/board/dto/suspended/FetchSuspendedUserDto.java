package net.feedbacky.app.data.board.dto.suspended;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 17.11.2020
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchSuspendedUserDto {

  private long id;
  private FetchSimpleUserDto user;
  private String suspensionEndDate;

}
