package net.feedbacky.app.rest.oauth.google;

import net.feedbacky.app.exception.types.LoginFailedException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.rest.data.user.ConnectedAccount;
import net.feedbacky.app.rest.data.user.User;
import net.feedbacky.app.rest.oauth.AbstractLoginController;
import net.feedbacky.app.rest.oauth.AuthGrant;
import net.feedbacky.app.utils.JwtTokenUtil;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 05.10.2019
 */
@RestController
public class GoogleLoginController implements AbstractLoginController {

  @Value("${oauth.google.redirect-uri}") private String redirectUri;
  @Value("${oauth.google.client-id}") private String clientId;
  @Value("${oauth.google.client-secret}") private String clientSecret;
  @Autowired private UserRepository userRepository;
  @Autowired private JwtTokenUtil jwtTokenUtil;

  @Override
  @GetMapping("/service/v1/google")
  public ResponseEntity handle(HttpServletResponse response, HttpServletRequest request, @RequestParam(name = "code") String code) throws IOException {
    //todo dry
    URL url = new URL("https://www.googleapis.com/oauth2/v4/token");
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestMethod("POST");
    conn.setRequestProperty("User-Agent", "Feedbacky Login Fetcher/1.1");
    conn.setDoOutput(true);

    OutputStream os = conn.getOutputStream();
    os.write(("grant_type=authorization_code&client_id=" + clientId + "&client_secret=" + clientSecret
        + "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8") + "&code=" + code).getBytes(StandardCharsets.UTF_8));
    os.flush();
    os.close();

    int responseCode = conn.getResponseCode();
    if (responseCode != HttpURLConnection.HTTP_OK) {
      throw new LoginFailedException("Failed to log in via Google! Code: " + responseCode + ". Message: " + conn.getResponseMessage());
    }

    AuthGrant grant = new ObjectMapper().readValue(getResponse(conn.getInputStream()), AuthGrant.class);
    User user = connectAsGoogleUser(grant);
    conn.disconnect();

    Map<String, Object> json = new HashMap<>();
    String jwtToken = jwtTokenUtil.generateToken(user.getEmail());
    json.put("token", jwtToken);
    json.put("user", user.convertToDto().exposeSensitiveData(true));
    return ResponseEntity.ok().body(json);
  }

  private User connectAsGoogleUser(AuthGrant grant) throws IOException {
    URL url = new URL("https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestProperty("User-Agent", "Feedbacky Login Finalizer/1.1");
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
    conn.setRequestProperty("Authorization", "Bearer " + grant.getAccessToken());
    conn.setDoOutput(true);

    GoogleUser googleUser = new ObjectMapper().readValue(getResponse(conn.getInputStream()), GoogleUser.class);
    if (googleUser.getEmail() == null) {
      throw new LoginFailedException("Email for this Google user is not valid.");
    }
    if(!googleUser.getEmailVerified()) {
      throw new LoginFailedException("Email for this Google user is not verified.");
    }

    Optional<User> optional = userRepository.findByEmail(googleUser.getEmail());
    if (!optional.isPresent()) {
      optional = Optional.of(new User());
      User user = optional.get();
      user.setEmail(googleUser.getEmail());
      user.setAvatar(googleUser.getAvatar());
      user.setUsername(googleUser.getName());
      Set<ConnectedAccount> accounts = new HashSet<>(user.getConnectedAccounts());
      accounts.add(generateConnectedAccount(googleUser, user));
      user.setConnectedAccounts(accounts);
      userRepository.save(user);
    } else {
      User user = optional.get();
      if (user.getConnectedAccounts().stream().noneMatch(acc -> acc.getType() == ConnectedAccount.AccountType.GOOGLE)) {
        Set<ConnectedAccount> accounts = new HashSet<>(user.getConnectedAccounts());
        accounts.add(generateConnectedAccount(googleUser, user));
        user.setConnectedAccounts(accounts);
        userRepository.save(user);
      }
    }
    conn.disconnect();
    return optional.get();
  }

  private ConnectedAccount generateConnectedAccount(GoogleUser googleUser, User user) {
    ConnectedAccount account = new ConnectedAccount();
    account.setUser(user);
    account.setType(ConnectedAccount.AccountType.GOOGLE);
    Map<String, String> data = new HashMap<>();
    data.put("GOOGLE_UID", String.valueOf(googleUser.getId()));
    data.put("USERNAME", googleUser.getName());
    data.put("AVATAR", googleUser.getAvatar());
    data.put("EMAIL", googleUser.getEmail());
    try {
      account.setData(new ObjectMapper().writeValueAsString(data));
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
    return account;
  }

}
