package net.feedbacky.app.rest.oauth;

import net.feedbacky.app.rest.oauth.provider.AbstractLoginProvider;
import net.feedbacky.app.rest.oauth.provider.AuthProviderData;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 08.03.2020
 */
@RestController
public class AuthAvailabilityController {

  private LoginProviderRegistry loginProviderRegistry;

  public AuthAvailabilityController(LoginProviderRegistry loginProviderRegistry) {
    this.loginProviderRegistry = loginProviderRegistry;
  }

  @GetMapping("/v1/service/providers")
  public ResponseEntity<List<AuthProviderData>> handle() {
    return ResponseEntity.ok(loginProviderRegistry.getRegisteredProviders().stream().map(AbstractLoginProvider::getProviderData).collect(Collectors.toList()));
  }

}
