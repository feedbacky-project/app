package net.feedbacky.app.exception;

import java.util.Collections;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

import org.springframework.http.HttpStatus;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Getter
@AllArgsConstructor
public class RestApiError {

  private HttpStatus status;
  private List<String> errors;

  public RestApiError(HttpStatus status, String error) {
    this.status = status;
    this.errors = Collections.singletonList(error);
  }

}
