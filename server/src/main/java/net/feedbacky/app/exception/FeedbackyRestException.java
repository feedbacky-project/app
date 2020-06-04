package net.feedbacky.app.exception;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 02.10.2019
 */
public class FeedbackyRestException extends RuntimeException {

  private final HttpStatus httpStatus;

  public FeedbackyRestException(HttpStatus status) {
    super();
    this.httpStatus = status;
  }

  public FeedbackyRestException(HttpStatus status, String message) {
    super(message);
    this.httpStatus = status;
  }

  public HttpStatus getHttpStatus() {
    return httpStatus;
  }
}
