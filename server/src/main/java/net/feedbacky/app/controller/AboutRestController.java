package net.feedbacky.app.controller;

import net.feedbacky.app.data.AboutFeedbackyData;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.oauth.LoginProviderRegistry;
import net.feedbacky.app.repository.UserRepository;

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
    //lazy init to make sure all login providers are registered before
    if(this.aboutFeedbackyData == null) {
      List<FetchUserDto> admins = userRepository.findByServiceStaffTrue().stream().map(user -> user.convertToDto().exposeSensitiveData(false)).collect(Collectors.toList());
      this.aboutFeedbackyData = new AboutFeedbackyData(loginProviderRegistry.getRegisteredProviders(), maintenanceMode, admins);
    }
    return ResponseEntity.ok(aboutFeedbackyData);
  }

}
