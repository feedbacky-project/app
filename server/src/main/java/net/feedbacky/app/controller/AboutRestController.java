package net.feedbacky.app.controller;

import net.feedbacky.app.config.LocalConfiguration;
import net.feedbacky.app.data.AboutFeedbackyData;
import net.feedbacky.app.oauth.LoginProviderRegistry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@RestController
public class AboutRestController {

  private LoginProviderRegistry loginProviderRegistry;
  private LocalConfiguration localConfiguration;
  private AboutFeedbackyData aboutFeedbackyData = null;

  @Autowired
  public AboutRestController(LoginProviderRegistry loginProviderRegistry, LocalConfiguration localConfiguration) {
    this.loginProviderRegistry = loginProviderRegistry;
    this.localConfiguration = localConfiguration;
  }

  @GetMapping("/v1/service/about")
  public ResponseEntity<AboutFeedbackyData> handle() {
    if(this.aboutFeedbackyData == null) {
      this.aboutFeedbackyData = new AboutFeedbackyData(loginProviderRegistry.getRegisteredProviders(),
              localConfiguration.getConfiguration().getBoolean(LocalConfiguration.Settings.PUBLIC_BOARDS_CREATION.name()),
              localConfiguration.getConfiguration().getBoolean(LocalConfiguration.Settings.INITIAL_INSTALLATION.name()));
    }
    return ResponseEntity.ok(aboutFeedbackyData);
  }

}
