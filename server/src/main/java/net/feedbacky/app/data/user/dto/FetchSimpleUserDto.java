package net.feedbacky.app.data.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 27.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchSimpleUserDto {

  private long id;
  private String username;
  private String avatar;
  private final String userUrl = "/v1/users/:id";

}
