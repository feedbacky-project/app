package net.feedbacky.app.util.mailservice;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 02.06.2020
 */
public class SendGridMailService implements MailService {

  private static final String apiKey = System.getenv("MAIL_SERVICE_API_KEY");
  private static final String baseUrl = System.getenv("MAIL_SERVICE_API_BASE_URL");
  private static final String mailSender = System.getenv("MAIL_SENDER");

  @Override
  public void send(String to, String subject, String text, String html) {
    try {
      doSend(to, subject, text, html);
    } catch(UnirestException | IOException e) {
      Logger.getAnonymousLogger().log(Level.SEVERE, "SendGrid mail sending failed.");
      e.printStackTrace();
    }
  }

  private void doSend(String to, String subject, String text, String html) throws IOException, UnirestException {
    Map<String, Object> data = new HashMap<>();
    data.put("personalizations", Collections.singletonList(new Personalizations(Collections.singletonList(new To(to)), subject)));
    data.put("from", new From(mailSender));
    data.put("content", Arrays.asList(new Content("text/plain", text), new Content("text/html", html)));
    ObjectMapper mapper = new ObjectMapper();
    Unirest.post(baseUrl)
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .body(mapper.writeValueAsString(data)).asJson();
  }

  @Getter
  @Setter
  @AllArgsConstructor
  private static class Personalizations {
    private List<To> to;
    private String subject;
  }

  @Getter
  @Setter
  @AllArgsConstructor
  private static class To {
    private String email;
  }

  @Getter
  @Setter
  @AllArgsConstructor
  private static class From {
    private String email;
  }

  @Getter
  @Setter
  @AllArgsConstructor
  private static class Content {
    private String type;
    private String value;
  }

}
