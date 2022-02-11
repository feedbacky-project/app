package net.feedbacky.app.util.request;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import java.util.HashSet;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@Component
public class PublicRequestValidator {

  private UserRepository userRepository;

  @Autowired
  public PublicRequestValidator(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public void validateApiKeyFromRequest(HttpServletRequest request, Board board) {
    String auth = request.getHeader("Authorization") /* non null and with Apikey type via request filter */;
    String apiKey = auth.substring(7);
    if(board.getApiKey().equals("") || !board.getApiKey().equals(apiKey)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid Apikey provided.");
    }
  }

  public User getUserByTokenOnly(HttpServletRequest request) {
    String userToken = request.getHeader("X-Feedbacky-User-Token");
    if(userToken == null || userToken.equals("")) {
      return null;
    }
    return userRepository.findByToken(userToken).orElse(null);
  }

  public User getUser(Board board, HttpServletRequest request) {
    String userToken = request.getHeader("X-Feedbacky-User-Token");
    String username = request.getHeader("X-Feedbacky-User-Username");
    if(userToken != null) {
      return getUserByToken(userToken, board);
    } else if(username != null) {
      String avatar = request.getHeader("X-Feedbacky-User-Avatar");
      return createUser(username, avatar, board);
    } else {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No valid Public API headers set, check https://docs.feedbacky.net/ for help.");
    }
  }

  private User getUserByToken(String userToken, Board board) {
    validateUserToken(userToken, board);
    return userRepository.findByToken(userToken)
            .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid X-Feedbacky-User-Token provided."));
  }

  private void validateUserToken(String userToken, Board board) {
    String[] data = userToken.split("-");
    if(data.length != 2 || board.getId() != Long.parseLong(data[0])) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid X-Feedbacky-User-Token provided.");
    }
  }

  private User createUser(String username, String avatar, Board board) {
    if(username.equals("") || username.length() < 3 || username.length() > 35) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "X-Feedbacky-User-Username must be between 3 and 35 characters long.");
    }
    User user = new User();
    user.setUsername(username);
    if(avatar != null) {
      user.setAvatar(avatar);
    } else {
      user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", username));
    }
    user.setFake(true);
    String userToken = board.getId() + "-" + RandomStringUtils.randomAlphanumeric(10);
    user.setEmail(userToken + "-fake@feedbacky.net");
    user.setToken(userToken);
    user.setServiceStaff(false);
    user.setPermissions(new HashSet<>());
    user.setConnectedAccounts(new HashSet<>());
    MailPreferences preferences = new MailPreferences();
    preferences.setNotificationsEnabled(false);
    preferences.setUser(user);
    preferences.setUnsubscribeToken("");
    user.setMailPreferences(preferences);
    return userRepository.save(user);
  }

}
