package net.feedbacky.app.util.mailservice;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 02.06.2020
 */
public class SendGridMailService implements MailService {

  private static String apiKey = System.getenv("MAIL_SENDGRID_API_KEY");
  private static String baseUrl = System.getenv("MAIL_SENDGRID_API_BASE_URL");
  private static String mailSender = System.getenv("MAIL_SENDER");

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
    Map<String, String> mailReceivers = new HashMap<>();
    mailReceivers.put("email", to);
    data.put("personalizations", new Personalizations(mailReceivers, subject));
    data.put("from", new From(mailSender));
    data.put("content", Arrays.asList(new Content("text/plain", text), new Content("text/html", html)));
    ObjectMapper mapper = new ObjectMapper();
    Unirest.post(baseUrl).header("Authorization", "Bearer " + apiKey).body(mapper.writeValueAsString(data)).asJson();
  }

  @Getter
  @Setter
  @AllArgsConstructor
  private static class Personalizations {
    private Map<String, String> to;
    private String subject;
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
