package net.feedbacky.app.rest.oauth;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
public interface AbstractLoginController {

  ResponseEntity handle(HttpServletResponse response, HttpServletRequest request, String code) throws IOException;

  @Deprecated //todo remove
  default Cookie getLoginCookie(String jwt) {
    Cookie cookie = new Cookie("SESSION", jwt);
    cookie.setPath("/");
    //todo change later
    cookie.setDomain(".github.io");
    cookie.setSecure(true);
    cookie.setHttpOnly(true);
    cookie.setMaxAge(1209600 /* 14 days */);
    return cookie;
  }

  default String getResponse(InputStream inputStream) throws IOException {
    BufferedReader in = new BufferedReader(new InputStreamReader(inputStream));
    String inputLine;
    StringBuilder response = new StringBuilder();
    while((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();
    return response.toString();
  }

}
