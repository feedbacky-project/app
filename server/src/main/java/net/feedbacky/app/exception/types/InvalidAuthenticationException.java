package net.feedbacky.app.exception.types;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
public class InvalidAuthenticationException extends FeedbackyRestException {

  public InvalidAuthenticationException() {
    super(HttpStatus.FORBIDDEN, "Session not found. Try again with new token.");
  }

  public InvalidAuthenticationException(String message) {
    super(HttpStatus.FORBIDDEN, message);
  }
}
