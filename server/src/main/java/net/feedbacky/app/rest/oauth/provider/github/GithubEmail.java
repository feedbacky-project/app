package net.feedbacky.app.rest.oauth.provider.github;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Plajer
 * <p>
 * Created at 05.10.2019
 */
@AllArgsConstructor
@Getter
public class GithubEmail {

  private String email;
  private boolean primary;

}
