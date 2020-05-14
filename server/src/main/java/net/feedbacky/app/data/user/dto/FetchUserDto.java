package net.feedbacky.app.data.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.dto.moderator.FetchUserPermissionDto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import org.modelmapper.ModelMapper;

import java.util.Date;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder({"id", "username", "avatar", "email", "permissionsUrl", "connectedAccountsUrl", "creationDate"})
public class FetchUserDto {

  private final String permissionsUrl = "/v1/users/:id/permissions";
  private final String connectedAccountsUrl = "/v1/users/@me/connectedAccounts";
  private long id;
  private String username;
  private String avatar;
  private String email;
  private FetchMailPreferences mailPreferences;
  private List<FetchUserPermissionDto> permissions;
  private Date creationDate;

  public FetchSimpleUserDto convertToSimpleDto() {
    return new ModelMapper().map(this, FetchSimpleUserDto.class);
  }

}
