package net.feedbacky.app.data.board.dto.moderator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchModeratorDto {

  private long userId;
  private FetchSimpleUserDto user;
  private Moderator.Role role;

}
