package net.feedbacky.app.data.board.dto.suspended;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

/**
 * @author Plajer
 * <p>
 * Created at 17.11.2020
 */
@Getter
public class FetchSuspendedUserDto implements FetchResponseDto<FetchSuspendedUserDto, SuspendedUser> {

  private long id;
  private FetchSimpleUserDto user;
  private String suspensionEndDate;

  @Override
  public FetchSuspendedUserDto from(SuspendedUser entity) {
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.suspensionEndDate = entity.getSuspensionEndDate().toString();
    return this;
  }

}
