package net.feedbacky.app.service.login;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
public interface LoginService {

  ResponseEntity handleLogin(String provider, String code);

  ResponseEntity handleMagicLinkRequest(String email);

}
