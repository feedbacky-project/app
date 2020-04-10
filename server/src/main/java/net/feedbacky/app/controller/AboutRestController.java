package net.feedbacky.app.controller;

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
  private boolean publicBoardsCreation = Boolean.parseBoolean(System.getenv("SETTINGS_PUBLIC_BOARDS_CREATION"));
  private boolean maintenanceMode = Boolean.parseBoolean(System.getenv("SETTINGS_MAINTENANCE_MODE"));
  private AboutFeedbackyData aboutFeedbackyData = null;

  @Autowired
  public AboutRestController(LoginProviderRegistry loginProviderRegistry) {
    this.loginProviderRegistry = loginProviderRegistry;
  }

  @GetMapping("/v1/service/about")
  public ResponseEntity<AboutFeedbackyData> handle() {
    //lazy init to make sure all login providers are registered before
    if(this.aboutFeedbackyData == null) {
      this.aboutFeedbackyData = new AboutFeedbackyData(loginProviderRegistry.getRegisteredProviders(), publicBoardsCreation, maintenanceMode);
    }
    return ResponseEntity.ok(aboutFeedbackyData);
  }

}
