package net.feedbacky.app.util.request;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.service.ServiceUser;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

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

  public static User getRequestUser(UserRepository repository) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    return repository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElseThrow(InvalidAuthenticationException::new);
  }

  public static User getRequestUserWithNamedGraph(UserRepository repository, String graph) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    return repository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphs.named(graph)).orElseThrow(InvalidAuthenticationException::new);
  }

}
