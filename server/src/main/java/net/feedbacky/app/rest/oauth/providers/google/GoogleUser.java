package net.feedbacky.app.rest.oauth.providers.google;

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
public class GoogleUser {

  private String id;
  private String email;
  private String name;
  @JsonProperty("picture")
  private String avatar;
  @JsonProperty("email_verified")
  private Boolean emailVerified;

}
