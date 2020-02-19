package net.feedbacky.app.rest.oauth.github;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.feedbacky.app.exception.types.LoginFailedException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.rest.data.user.ConnectedAccount;
import net.feedbacky.app.rest.data.user.User;
import net.feedbacky.app.rest.oauth.AbstractLoginController;
import net.feedbacky.app.rest.oauth.AuthGrant;
import net.feedbacky.app.utils.JwtTokenUtil;

import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 05.10.2019
 */
@RestController
public class GithubLoginController implements AbstractLoginController {

  @Value("${oauth.github.redirect-uri}") private String redirectUri;
  @Value("${oauth.github.client-id}") private String clientId;
  @Value("${oauth.github.client-secret}") private String clientSecret;
  @Autowired private UserRepository userRepository;
  @Autowired private JwtTokenUtil jwtTokenUtil;

  @Override
  @GetMapping("/service/v1/github")
  public ResponseEntity handle(HttpServletResponse response, HttpServletRequest request, @RequestParam(name = "code") String code) throws IOException {
    //todo dry
    URL url = new URL("https://github.com/login/oauth/access_token");
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestMethod("POST");
    conn.setRequestProperty("User-Agent", "Feedbacky Login Fetcher/1.1");
    conn.setDoOutput(true);
    conn.setRequestProperty("Accept", "application/json");

    OutputStream os = conn.getOutputStream();
    os.write(("client_id=" + clientId + "&client_secret=" + clientSecret
        + "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8") + "&code=" + code).getBytes(StandardCharsets.UTF_8));
    os.flush();
    os.close();

    int responseCode = conn.getResponseCode();
    if (responseCode != HttpURLConnection.HTTP_OK) {
      throw new LoginFailedException("Failed to log in via GitHub! Code: " + responseCode + ". Message: " + conn.getResponseMessage());
    }

    AuthGrant grant = new ObjectMapper().readValue(getResponse(conn.getInputStream()), AuthGrant.class);
    User user = connectAsGithubUser(grant);
    conn.disconnect();

    Map<String, Object> json = new HashMap<>();
    String jwtToken = jwtTokenUtil.generateToken(user.getEmail());
    json.put("token", jwtToken);
    json.put("user", user.convertToDto().exposeSensitiveData(true));
    response.addCookie(getLoginCookie(jwtToken));
    return ResponseEntity.ok().body(json);
  }

  private User connectAsGithubUser(AuthGrant grant) throws IOException {
    URL url = new URL("https://api.github.com/user");
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestProperty("User-Agent", "Feedbacky Login Finalizer/1.1");
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
    conn.setRequestProperty("Authorization", "token " + grant.getAccessToken());
    conn.setDoOutput(true);

    GithubUser githubUser = new ObjectMapper().readValue(getResponse(conn.getInputStream()), GithubUser.class);
    //email can be private thus we need to get all emails from separate api call
    if (githubUser.getEmail() == null) {
      URL emailsUrl = new URL("https://api.github.com/user/emails");
      HttpsURLConnection emailsConn = (HttpsURLConnection) emailsUrl.openConnection();
      emailsConn.setRequestProperty("User-Agent", "Feedbacky Login Finalizer/1.1");
      emailsConn.setRequestProperty("Content-Type", "application/json");
      emailsConn.setRequestProperty("Authorization", "token " + grant.getAccessToken());
      emailsConn.setDoOutput(true);

      List<GithubEmail> emails = new ObjectMapper().readValue(getResponse(emailsConn.getInputStream()), new TypeReference<List<GithubEmail>>() {});
      emailsConn.disconnect();
      GithubEmail connectedEmail = findSimilarEmails(emails);
      //user didn't connect to our services before, take primary email and register
      if (connectedEmail == null) {
        GithubEmail primaryEmail = emails.stream().filter(GithubEmail::isPrimary).findFirst().orElse(null);
        if (primaryEmail == null) {
          return null;
        }
        githubUser.setEmail(primaryEmail.getEmail());
      } else {
        githubUser.setEmail(connectedEmail.getEmail());
      }
    }

    Optional<User> optional = userRepository.findByEmail(githubUser.getEmail());
    if (!optional.isPresent()) {
      optional = Optional.of(new User());
      User user = optional.get();
      user.setEmail(githubUser.getEmail());
      user.setAvatar(githubUser.getAvatar());
      user.setUsername(githubUser.getUsername());
      Set<ConnectedAccount> accounts = new HashSet<>(user.getConnectedAccounts());
      accounts.add(generateConnectedAccount(githubUser, user));
      user.setConnectedAccounts(accounts);
      userRepository.save(user);
    } else {
      User user = optional.get();
      if (user.getConnectedAccounts().stream().noneMatch(acc -> acc.getType() == ConnectedAccount.AccountType.GITHUB)) {
        Set<ConnectedAccount> accounts = new HashSet<>(user.getConnectedAccounts());
        accounts.add(generateConnectedAccount(githubUser, user));
        user.setConnectedAccounts(accounts);
        userRepository.save(user);
      }
    }
    conn.disconnect();
    return optional.get();
  }

  private ConnectedAccount generateConnectedAccount(GithubUser githubUser, User user) {
    ConnectedAccount account = new ConnectedAccount();
    account.setUser(user);
    account.setType(ConnectedAccount.AccountType.GITHUB);
    Map<String, String> data = new HashMap<>();
    data.put("GITHUB_UID", String.valueOf(githubUser.getId()));
    data.put("USERNAME", githubUser.getUsername());
    data.put("EMAIL", githubUser.getEmail());
    data.put("AVATAR", githubUser.getAvatar());
    try {
      account.setData(new ObjectMapper().writeValueAsString(data));
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
    return account;
  }

  @Nullable
  private GithubEmail findSimilarEmails(List<GithubEmail> emails) {
    for (GithubEmail email : emails) {
      Optional<User> user = userRepository.findByEmail(email.getEmail());
      if (user.isPresent()) {
        return email;
      }
    }
    return null;
  }

}
