package net.feedbacky.app.data.board.dto.moderator;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.moderator.Moderator;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@Getter
public class FetchUserPermissionDto implements FetchResponseDto<FetchUserPermissionDto, Moderator> {

  private String boardDiscriminator;
  private String boardViewLink;
  private String boardName;
  private Moderator.Role role;

  @Override
  public FetchUserPermissionDto from(Moderator entity) {
    if(entity == null) {
      return null;
    }
    this.boardDiscriminator = entity.getBoard().getDiscriminator();
    this.boardViewLink = entity.getBoard().toViewLink();
    this.boardName = entity.getBoard().getName();
    this.role = entity.getRole();
    return this;
  }

}
