package net.feedbacky.app.util.request;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * @author Plajer
 * <p>
 * Created at 24.11.2019
 */
public class InternalRequestValidator {

  private InternalRequestValidator() {
  }

  public static UserAuthenticationToken getContextAuthentication() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth instanceof AnonymousAuthenticationToken) {
      throw new FeedbackyRestException(HttpStatus.FORBIDDEN, "Authorization is required to access this content.");
    }
    return (UserAuthenticationToken) auth;
  }

}
