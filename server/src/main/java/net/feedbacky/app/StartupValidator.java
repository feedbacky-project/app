package net.feedbacky.app;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 15.04.2020
 */
public class StartupValidator {

  public boolean validateStartup() {
    return validateEnvironmentVariables();
  }

  private boolean validateEnvironmentVariables() {
    List<EnvironmentVariables> missingVariables = new ArrayList<>();
    for(EnvironmentVariables variable : EnvironmentVariables.values()) {
      if(System.getenv(variable.name()) == null) {
        missingVariables.add(variable);
      }
    }
    if(!missingVariables.isEmpty()) {
      Logger logger = Logger.getLogger("Startup");
      logger.log(Level.WARNING, "There are missing environment variables in your .env file! Did you forget to add new variables after update?");
      logger.log(Level.WARNING, "Please refer to https://github.com/Plajer/feedbacky-project/blob/master/README.md#updating-from-older-versions for help with updating.");
      logger.log(Level.WARNING, "Your Feedbacky server version: " + FeedbackyApplication.BACKEND_VERSION);
      logger.log(Level.WARNING, "Missing variables:");
      for(EnvironmentVariables variable : missingVariables) {
        logger.log(Level.WARNING, variable.name() + " [MISSING] - Added in version " + variable.getSinceVersion());
      }
      return false;
    }
    return true;
  }

  //OAuth variables not included on purpose, unused providers can be removed from .env safely
  private enum EnvironmentVariables {
    REACT_APP_SERVER_IP_ADDRESS("0.1.0-beta"), REACT_APP_SERVICE_NAME("0.1.0-beta"), REACT_APP_DEFAULT_USER_AVATAR("0.1.0-beta"),
    CLIENT_APP_PORT("0.1.0-beta"), SERVER_APP_PORT("0.1.0-beta"), JWT_SECRET("0.1.0-beta"),
    MYSQL_USERNAME("0.1.0-beta"), MYSQL_PASSWORD("0.1.0-beta"), MYSQL_URL("0.1.0-beta"), MAIL_SENDER("0.1.0-beta"), MAIL_SERVICE_TYPE("0.1.0-beta"),
    MAIL_MAILGUN_API_KEY("0.1.0-beta"), MAIL_MAILGUN_API_BASE_URL("0.1.0-beta"), MAIL_SMTP_USERNAME("0.1.0-beta"), MAIL_SMTP_PASSWORD("0.1.0-beta"),
    MAIL_SMTP_HOST("0.1.0-beta"), MAIL_SMTP_PORT("0.1.0-beta"), IMAGE_COMPRESSION_ENABLED("0.1.0-beta"), IMAGE_COMPRESSION_TYPE("0.1.0-beta"),
    IMAGE_COMPRESSION_CHEETAHO_API_KEY("0.1.0-beta"),
    MAIL_SENDGRID_API_KEY("0.2.0-beta"), MAIL_SENDGRID_API_BASE_URL("0.2.0-beta"),
    SETTINGS_ALLOW_COMMENTING_CLOSED_IDEAS("0.5.0-beta");

    private final String sinceVersion;

    EnvironmentVariables(String sinceVersion) {
      this.sinceVersion = sinceVersion;
    }

    public String getSinceVersion() {
      return sinceVersion;
    }
  }

}
