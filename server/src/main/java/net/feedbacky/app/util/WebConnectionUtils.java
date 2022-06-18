package net.feedbacky.app.util;

import net.feedbacky.app.exception.types.LoginFailedException;
import net.feedbacky.app.login.LoginProvider;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.net.ssl.HttpsURLConnection;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
public class WebConnectionUtils {

  private WebConnectionUtils() {
  }

  public static String getAccessToken(String urlString, String content) throws IOException {
    URL url = new URL(urlString);
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestMethod("POST");
    conn.setRequestProperty("User-Agent", LoginProvider.USER_AGENT);
    conn.setRequestProperty("Accept", "application/json");
    conn.setDoOutput(true);

    OutputStream os = conn.getOutputStream();
    os.write(content.getBytes(StandardCharsets.UTF_8));
    os.flush();
    os.close();

    int responseCode = conn.getResponseCode();
    if(responseCode != HttpURLConnection.HTTP_OK) {
      throw new LoginFailedException("Failed to get access token! Code: " + responseCode + ". Message: " + conn.getResponseMessage());
    }
    Map<String, String> tokenData = new ObjectMapper().readValue(getResponse(conn.getInputStream()), Map.class);
    conn.disconnect();
    return tokenData.get("access_token");
  }

  public static String getResponse(InputStream inputStream) throws IOException {
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
