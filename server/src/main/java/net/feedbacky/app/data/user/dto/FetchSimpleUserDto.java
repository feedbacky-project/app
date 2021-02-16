package net.feedbacky.app.data.user.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.user.User;

/**
 * @author Plajer
 * <p>
 * Created at 27.10.2019
 */
@Getter
public class FetchSimpleUserDto implements FetchResponseDto<FetchSimpleUserDto, User> {

  private long id;
  private String username;
  private String avatar;
  private boolean fake;

  private String userUrl = "/v1/users/:id";

  @Override
  public FetchSimpleUserDto from(User entity) {
    this.id = entity.getId();
    this.username = entity.getUsername();
    this.avatar = entity.getAvatar();
    this.fake = entity.isFake();
    return this;
  }

}
