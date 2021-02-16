package net.feedbacky.app.data.user.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.dto.moderator.FetchUserPermissionDto;
import net.feedbacky.app.data.user.User;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
public class FetchUserDto implements FetchResponseDto<FetchUserDto, User> {

  private long id;
  private String username;
  private String avatar;
  private String email;
  private FetchMailPreferences mailPreferences;
  private List<FetchUserPermissionDto> permissions;
  private boolean fake;
  private Date creationDate;

  private String connectedAccountsUrl = "/v1/users/@me/connectedAccounts";

  @Override
  public FetchUserDto from(User entity) {
    this.id = entity.getId();
    this.username = entity.getUsername();
    this.avatar = entity.getAvatar();
    this.email = null;
    this.mailPreferences = new FetchMailPreferences().from(entity.getMailPreferences());
    this.permissions = entity.getPermissions().stream().map(permission -> new FetchUserPermissionDto().from(permission)).collect(Collectors.toList());
    this.fake = entity.isFake();
    this.creationDate = entity.getCreationDate();
    return this;
  }

  public FetchUserDto withConfidentialData(User entity) {
    this.email = entity.getEmail();
    return this;
  }

}
