package net.feedbacky.app.rest.data.user.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.modelmapper.ModelMapper;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonPropertyOrder( {"id", "username", "avatar", "email", "permissionsUrl", "connectedAccountsUrl", "creationDate"})
public class FetchUserDto {

  private final String permissionsUrl = "/v1/users/:id/permissions";
  private final String connectedAccountsUrl = "/v1/users/@me/connectedAccounts";
  private long id;
  private String username;
  private String avatar;
  private String email;
  private Date creationDate;

  public FetchSimpleUserDto convertToSimpleDto() {
    return new ModelMapper().map(this, FetchSimpleUserDto.class);
  }

}
