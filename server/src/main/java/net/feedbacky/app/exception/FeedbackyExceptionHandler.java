package net.feedbacky.app.exception;

import io.jsonwebtoken.MalformedJwtException;
import net.feedbacky.app.exception.types.InputException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@RestControllerAdvice
public class FeedbackyExceptionHandler {

  @ExceptionHandler(FeedbackyRestException.class)
  public ResponseEntity handleException(FeedbackyRestException ex) {
    return ResponseEntity.status(ex.getHttpStatus()).body(new RestApiError(ex.getHttpStatus(), ex.getMessage()));
  }

  @ExceptionHandler(UnsupportedOperationException.class)
  public ResponseEntity handleUnsupported(UnsupportedOperationException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new RestApiError(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage()));
  }

  @ExceptionHandler(InputException.class)
  public ResponseEntity handleInputException(InputException ex) {
    if (ex.getErrors().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, ex.getErrors()));
  }

  @ExceptionHandler(MalformedJwtException.class)
  public ResponseEntity handleMalformedJwt() {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, "Invalid JWT token provided."));
  }

  @ExceptionHandler(RequestRejectedException.class)
  public RestApiError handleRejected(RequestRejectedException ex) {
    Logger.getLogger("[FIREWALL ERR HANDLE]").log(Level.WARNING, ex.getMessage());
    return new RestApiError(HttpStatus.BAD_REQUEST, "Potentially malicious request denied.");
  }

}
