package net.feedbacky.app.exception.types;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
public class ResourceNotFoundException extends FeedbackyRestException {

  public ResourceNotFoundException() {
    super(HttpStatus.NOT_FOUND);
  }

  public ResourceNotFoundException(String message) {
    super(HttpStatus.NOT_FOUND, message);
  }

}
