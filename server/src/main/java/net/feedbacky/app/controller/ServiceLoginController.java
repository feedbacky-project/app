package net.feedbacky.app.controller;

import net.feedbacky.app.data.user.ConnectedAccount;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.types.LoginFailedException;
import net.feedbacky.app.login.LoginProvider;
import net.feedbacky.app.login.LoginProviderRegistry;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.util.JwtTokenUtil;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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
 * Created at 21.01.2021
 */
@CrossOrigin
@RestController
public class ServiceLoginController {

  private final LoginProviderRegistry loginProviderRegistry;
  private final UserRepository userRepository;

  @Autowired
  public ServiceLoginController(LoginProviderRegistry loginProviderRegistry, UserRepository userRepository) {
    this.loginProviderRegistry = loginProviderRegistry;
    this.userRepository = userRepository;
  }

  @GetMapping("v1/service/{id}")
  public ResponseEntity handle(HttpServletResponse response, HttpServletRequest request, @PathVariable String id, @RequestParam(name = "code") String code) throws IOException {
    LoginProvider provider = getLoginProviderById(id);
    if(!provider.isEnabled()) {
      throw new LoginFailedException("Sign in with '" + provider.getProviderData().getName() + "' is disabled.");
    }
    URL url = new URL(provider.getOauthDetails().getTokenUrl());
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestMethod("POST");
    conn.setRequestProperty("User-Agent", LoginProvider.USER_AGENT);
    conn.setRequestProperty("Accept", "application/json");
    conn.setDoOutput(true);

    OutputStream os = conn.getOutputStream();
    String content = "client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&redirect_uri={REDIRECT_URI}&code={CODE}&grant_type=authorization_code";
    content = StringUtils.replace(content, "{CLIENT_ID}", LoginProvider.EnvironmentVariables.readEnvVariable(provider.getEnvironmentVariables().getClientId()));
    content = StringUtils.replace(content, "{CLIENT_SECRET}", LoginProvider.EnvironmentVariables.readEnvVariable(provider.getEnvironmentVariables().getClientSecret()));
    content = StringUtils.replace(content, "{REDIRECT_URI}", URLEncoder.encode(
            LoginProvider.EnvironmentVariables.readEnvVariable(provider.getEnvironmentVariables().getRedirectUri()), "UTF-8"));
    content = StringUtils.replace(content, "{CODE}", code);
    os.write(content.getBytes(StandardCharsets.UTF_8));
    os.flush();
    os.close();

    int responseCode = conn.getResponseCode();
    if(responseCode != HttpURLConnection.HTTP_OK) {
      throw new LoginFailedException("Failed to sign in with '" + provider.getProviderData().getName() + "' ! Code: " + responseCode + ". Message: " + conn.getResponseMessage());
    }
    Map<String, String> tokenData = new ObjectMapper().readValue(getResponse(conn.getInputStream()), Map.class);
    conn.disconnect();
    String token = tokenData.get("access_token");
    User user = connectAsUser(id, provider, token);
    Map<String, Object> json = new HashMap<>();
    String jwtToken = JwtTokenUtil.generateToken(user.getEmail());
    json.put("token", jwtToken);
    json.put("user", new FetchUserDto().from(user).withConfidentialData(user));
    return ResponseEntity.ok().body(json);
  }

  private LoginProvider getLoginProviderById(String id) {
    for(LoginProvider provider : loginProviderRegistry.getProviders()) {
      if(provider.getId().equals(id)) {
        return provider;
      }
    }
    throw new LoginFailedException("Sign in with '" + id + "' is not supported.");
  }

  private String getResponse(InputStream inputStream) throws IOException {
    BufferedReader in = new BufferedReader(new InputStreamReader(inputStream));
    String inputLine;
    StringBuilder response = new StringBuilder();
    while((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();
    return response.toString();
  }

  private User connectAsUser(String id, LoginProvider provider, String token) throws IOException {
    URL url = new URL(provider.getOauthDetails().getUserUrl());
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestProperty("User-Agent", LoginProvider.USER_AGENT);
    conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
    String authorization = provider.getOauthDetails().getAuthorizationProperty();
    authorization = StringUtils.replace(authorization, "{TOKEN}", token);
    conn.setRequestProperty("Authorization", authorization);
    conn.setDoOutput(true);

    Map<String, Object> responseData = new ObjectMapper().readValue(getResponse(conn.getInputStream()), Map.class);
    conn.disconnect();
    if(responseData.get(provider.getOauthDetails().getDataFields().getEmail()) == null) {
      throw new LoginFailedException("Email address not found, please contact administrator if you think it's an error.");
    }
    if(provider.getOauthDetails().getDataFields().getEmailVerified() != null) {
      Boolean mailVerified = (Boolean) responseData.get(provider.getOauthDetails().getDataFields().getEmailVerified());
      if(mailVerified != null && !mailVerified) {
        throw new LoginFailedException("Email address you sign in with is not verified at '" + provider.getProviderData().getName() + "', please verify email to continue.");
      }
    }

    return createOrUpdateUser(id, responseData, provider.getOauthDetails().getDataFields());
  }

  private User createOrUpdateUser(String id, Map<String, Object> data, LoginProvider.OauthDetails.DataFields fields) {
    Optional<User> optional = userRepository.findByEmail((String) data.get(fields.getEmail()));
    if(!optional.isPresent()) {
      optional = Optional.of(new User());
      User user = optional.get();
      user.setEmail((String) data.get(fields.getEmail()));
      if(fields.getAvatar() == null || data.get(fields.getAvatar()) == null) {
        user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", (String) data.get(fields.getUsername())));
      } else {
        user.setAvatar((String) data.get(fields.getAvatar()));
      }
      user.setUsername((String) data.get(fields.getUsername()));
      MailPreferences preferences = new MailPreferences();
      preferences.setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
      preferences.setNotificationsEnabled(true);
      preferences.setUser(user);
      user.setMailPreferences(preferences);
      Set<ConnectedAccount> accounts = new HashSet<>();
      accounts.add(generateConnectedAccount(id, data, fields, user));
      user.setConnectedAccounts(accounts);
      //first user, set as service staff
      if(userRepository.count() == 0) {
        user.setServiceStaff(true);
      }
      return userRepository.save(user);
    } else {
      User user = optional.get();
      if(user.getConnectedAccounts().stream().noneMatch(acc -> acc.getProvider().equals(id))) {
        Set<ConnectedAccount> accounts = new HashSet<>(user.getConnectedAccounts());
        accounts.add(generateConnectedAccount(id, data, fields, user));
        user.setConnectedAccounts(accounts);
        return userRepository.save(user);
      }
      return user;
    }
  }

  private ConnectedAccount generateConnectedAccount(String id, Map<String, Object> data, LoginProvider.OauthDetails.DataFields fields, User user) {
    ConnectedAccount account = new ConnectedAccount();
    account.setUser(user);
    account.setProvider(id);
    account.setAccountId(String.valueOf(data.get(fields.getId())));
    return account;
  }

}
