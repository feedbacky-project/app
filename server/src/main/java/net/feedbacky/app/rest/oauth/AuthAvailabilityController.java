package net.feedbacky.app.rest.oauth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 08.03.2020
 */
@RestController
public class AuthAvailabilityController {

  private boolean googleEnabled = Boolean.parseBoolean(System.getenv("SERVER_OAUTH_GOOGLE_ENABLED"));
  private boolean discordEnabled = Boolean.parseBoolean(System.getenv("SERVER_OAUTH_DISCORD_ENABLED"));
  private boolean githubEnabled = Boolean.parseBoolean(System.getenv("SERVER_OAUTH_GITHUB_ENABLED"));

  @GetMapping("/service/v1/availability")
  public ResponseEntity handle() {
    Map<String, Boolean> data = new HashMap<>();
    data.put("discord", discordEnabled);
    data.put("google", googleEnabled);
    data.put("github", githubEnabled);
    return ResponseEntity.ok(data);
  }

}
