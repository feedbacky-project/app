package net.feedbacky.app.rest.oauth.github;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Plajer
 * <p>
 * Created at 05.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GithubUser {

  private String id;
  @JsonProperty("login")
  private String username;
  @JsonProperty("avatar_url")
  private String avatar;
  private String email;

}
