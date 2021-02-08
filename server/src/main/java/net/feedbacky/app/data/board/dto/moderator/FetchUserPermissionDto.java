package net.feedbacky.app.data.board.dto.moderator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.moderator.Moderator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchUserPermissionDto implements FetchResponseDto<FetchUserPermissionDto, Moderator> {

  private String boardDiscriminator;
  private String boardName;
  private Moderator.Role role;

  @Override
  public FetchUserPermissionDto from(Moderator entity) {
    this.boardDiscriminator = entity.getBoard().getDiscriminator();
    this.boardName = entity.getBoard().getName();
    this.role = entity.getRole();
    return this;
  }

}
