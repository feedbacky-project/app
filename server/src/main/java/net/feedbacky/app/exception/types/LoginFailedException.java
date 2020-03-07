package net.feedbacky.app.exception.types;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
public class LoginFailedException extends FeedbackyRestException {

  public LoginFailedException() {
    super(HttpStatus.FORBIDDEN);
  }

  public LoginFailedException(String message) {
    super(HttpStatus.FORBIDDEN, message);
  }
}
