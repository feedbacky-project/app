package net.feedbacky.app.exception.types;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
public class InputException extends FeedbackyRestException {

  private final List<String> messages = new ArrayList<>();

  public InputException() {
    super(HttpStatus.BAD_REQUEST);
  }

  public InputException(String message) {
    super(HttpStatus.BAD_REQUEST, message);
  }

  public InputException(List<String> messages) {
    super(HttpStatus.BAD_REQUEST);
    this.messages.addAll(messages);
  }

  public List<String> getErrors() {
    return Collections.unmodifiableList(messages);
  }
}
