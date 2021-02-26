package net.feedbacky.app.exception.types;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 26.02.2021
 */
public class InsufficientPermissionsException extends FeedbackyRestException {

  public InsufficientPermissionsException() {
    super(HttpStatus.FORBIDDEN, "Insufficient permissions.");
  }

  public InsufficientPermissionsException(String message) {
    super(HttpStatus.FORBIDDEN, message);
  }

}
