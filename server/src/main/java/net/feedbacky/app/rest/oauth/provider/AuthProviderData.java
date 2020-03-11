package net.feedbacky.app.rest.oauth.provider;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author Plajer
 * <p>
 * Created at 10.03.2020
 */
@Data
@AllArgsConstructor
public class AuthProviderData {

  private String name;
  private String oauthLink;
  private String icon;
  private String color;

}
