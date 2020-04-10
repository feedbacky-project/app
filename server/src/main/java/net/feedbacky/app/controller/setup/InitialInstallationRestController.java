package net.feedbacky.app.controller.setup;

import net.feedbacky.app.config.LocalConfiguration;
import net.feedbacky.app.exception.FeedbackyRestException;

import org.apache.commons.configuration.DatabaseConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

/**
 * @author Plajer
 * <p>
 * Created at 12.03.2020
 */
@RestController
public class InitialInstallationRestController {

  private LocalConfiguration localConfiguration;

  @Autowired
  public InitialInstallationRestController(LocalConfiguration localConfiguration) {
    this.localConfiguration = localConfiguration;
  }

  @PostMapping("v1/service/setup/provider")
  public ResponseEntity handle(@Valid @RequestBody ProviderSetupData data) {
    DatabaseConfiguration config = localConfiguration.getConfiguration();
    switch(data.getType()) {
      case DISCORD:
        if(config.getBoolean(LocalConfiguration.Settings.OAUTH_DISCORD_ENABLED.name())) {
          throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Discord provider already enabled");
        }
        config.setProperty(LocalConfiguration.Settings.OAUTH_DISCORD_ENABLED.name(), true);
        config.setProperty(LocalConfiguration.Settings.OAUTH_DISCORD_CLIENT_ID.name(), data.getClientId());
        config.setProperty(LocalConfiguration.Settings.OAUTH_DISCORD_CLIENT_SECRET.name(), data.getClientSecret());
        return ResponseEntity.ok().build();
      case GOOGLE:
        if(config.getBoolean(LocalConfiguration.Settings.OAUTH_GOOGLE_ENABLED.name())) {
          throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Google provider already enabled");
        }
        config.setProperty(LocalConfiguration.Settings.OAUTH_GOOGLE_ENABLED.name(), true);
        config.setProperty(LocalConfiguration.Settings.OAUTH_GOOGLE_CLIENT_ID.name(), data.getClientId());
        config.setProperty(LocalConfiguration.Settings.OAUTH_GOOGLE_CLIENT_SECRET.name(), data.getClientSecret());
        return ResponseEntity.ok().build();
      case GITHUB:
        if(config.getBoolean(LocalConfiguration.Settings.OAUTH_GITHUB_ENABLED.name())) {
          throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub provider already enabled");
        }
        config.setProperty(LocalConfiguration.Settings.OAUTH_GITHUB_ENABLED.name(), true);
        config.setProperty(LocalConfiguration.Settings.OAUTH_GITHUB_CLIENT_ID.name(), data.getClientId());
        config.setProperty(LocalConfiguration.Settings.OAUTH_GITHUB_CLIENT_SECRET.name(), data.getClientSecret());
        return ResponseEntity.ok().build();
    }
    throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid provider");
  }

}
