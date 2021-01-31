package net.feedbacky.app.login;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author Plajer
 * <p>
 * Created at 21.01.2021
 */
@AllArgsConstructor
@Getter
public class LoginProvider {

  public static final String USER_AGENT = "FeedbackyApp/1.0 (https://feedbacky.net)";
  private String id;
  private ProviderData providerData;
  private boolean enabled;
  private OauthDetails oauthDetails;
  private EnvironmentVariables environmentVariables;

  @AllArgsConstructor
  @Getter
  public static class ProviderData {
    private String name;
    private String oauthLink;
    private String icon;
    private String color;
  }

  @AllArgsConstructor
  @Getter
  public static class OauthDetails {
    private String tokenUrl;
    private String authorizationProperty;
    private String userUrl;
    private DataFields dataFields;

    @AllArgsConstructor
    @Getter
    public static class DataFields {
      private String id;
      private String email;
      private String username;
      private String avatar;
      private String emailVerified;
    }
  }

  @AllArgsConstructor
  @Getter
  public static class EnvironmentVariables {
    private String redirectUri;
    private String clientId;
    private String clientSecret;

    public static String readEnvVariable(String variable) {
      return System.getenv(variable);
    }

    public static String readEnvVariable(String variable, String defaultValue) {
      String env = System.getenv(variable);
      if(env == null) {
        return defaultValue;
      }
      return env;
    }
  }

}
