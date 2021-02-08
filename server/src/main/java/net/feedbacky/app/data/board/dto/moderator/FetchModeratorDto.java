package net.feedbacky.app.data.board.dto.moderator;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Getter
public class FetchModeratorDto implements FetchResponseDto<FetchModeratorDto, Moderator> {

  private long userId;
  private FetchSimpleUserDto user;
  private Moderator.Role role;

  @Override
  public FetchModeratorDto from(Moderator entity) {
    this.userId = entity.getUser().getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.role = entity.getRole();
    return this;
  }

}
