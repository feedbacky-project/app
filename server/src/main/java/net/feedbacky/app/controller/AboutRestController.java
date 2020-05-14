package net.feedbacky.app.controller;

import net.feedbacky.app.FeedbackyApplication;
import net.feedbacky.app.data.AboutFeedbackyData;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.oauth.LoginProviderRegistry;
import net.feedbacky.app.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@CrossOrigin
@RestController
public class AboutRestController {

  private LoginProviderRegistry loginProviderRegistry;
  private boolean maintenanceMode = Boolean.parseBoolean(System.getenv("SETTINGS_MAINTENANCE_MODE"));
  private AboutFeedbackyData aboutFeedbackyData = null;
  private UserRepository userRepository;

  @Autowired
  public AboutRestController(LoginProviderRegistry loginProviderRegistry, UserRepository userRepository) {
    this.loginProviderRegistry = loginProviderRegistry;
    this.userRepository = userRepository;
  }

  @GetMapping("/v1/service/about")
  public ResponseEntity<AboutFeedbackyData> handle() {
    AboutFeedbackyData data;
    //lazy init to make sure all login providers are registered before
    if(this.aboutFeedbackyData == null) {
      List<FetchUserDto> admins = userRepository.findByServiceStaffTrue().stream().map(user -> user.convertToDto().exposeSensitiveData(false)).collect(Collectors.toList());
      data = new AboutFeedbackyData(FeedbackyApplication.BACKEND_VERSION, loginProviderRegistry.getRegisteredProviders(), maintenanceMode, admins);
      //only cache when there is at least 1 service admin registered (for first installation purposes)
      if(!admins.isEmpty()) {
        this.aboutFeedbackyData = data;
      }
    } else {
      data = this.aboutFeedbackyData;
    }
    return ResponseEntity.ok(data);
  }

}
