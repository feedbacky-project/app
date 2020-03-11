package net.feedbacky.app.rest.controller;

import net.feedbacky.app.rest.data.AboutFeedbackyData;
import net.feedbacky.app.rest.oauth.LoginProviderRegistry;
import net.feedbacky.app.rest.oauth.provider.AbstractLoginProvider;
import net.feedbacky.app.rest.oauth.provider.AuthProviderData;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@RestController
public class AboutRestController {

  private LoginProviderRegistry loginProviderRegistry;
  private AboutFeedbackyData aboutFeedbackyData = null;

  @Autowired
  public AboutRestController(LoginProviderRegistry loginProviderRegistry) {
    this.loginProviderRegistry = loginProviderRegistry;
  }

  @GetMapping("/v1/service/about")
  public ResponseEntity<List<AuthProviderData>> handle() {
    if(this.aboutFeedbackyData == null) {
      this.aboutFeedbackyData = new AboutFeedbackyData(loginProviderRegistry.getRegisteredProviders(), Boolean.parseBoolean(System.getenv("SERVER_SETTINGS_PUBLIC_BOARDS_CREATION")));
    }
    return ResponseEntity.ok(loginProviderRegistry.getRegisteredProviders().stream().map(AbstractLoginProvider::getProviderData).collect(Collectors.toList()));
  }

}
