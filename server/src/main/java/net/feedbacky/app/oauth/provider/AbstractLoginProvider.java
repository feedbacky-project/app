package net.feedbacky.app.oauth.provider;

import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
public interface AbstractLoginProvider {

  ResponseEntity handle(HttpServletResponse response, HttpServletRequest request, String code) throws IOException;

  AuthProviderData getProviderData();

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
