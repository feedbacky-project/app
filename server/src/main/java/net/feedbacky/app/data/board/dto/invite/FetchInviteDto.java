package net.feedbacky.app.data.board.dto.invite;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Getter
public class FetchInviteDto implements FetchResponseDto<FetchInviteDto, Invitation> {

  private long id;
  private FetchSimpleUserDto user;
  private String code;

  @Override
  public FetchInviteDto from(Invitation entity) {
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.code = entity.getCode();
    return this;
  }

}
