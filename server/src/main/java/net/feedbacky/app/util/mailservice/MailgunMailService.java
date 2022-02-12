package net.feedbacky.app.util.mailservice;

import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
public class MailgunMailService implements MailService {

  private static final String apiKey = System.getenv("MAIL_SERVICE_API_KEY");
  private static final String baseUrl = System.getenv("MAIL_SERVICE_API_BASE_URL");
  private static final String mailSender = System.getenv("MAIL_SENDER");

  @Override
  public void send(String to, String subject, String text, String html) {
    try {
      doSend(to, subject, text, html);
    } catch(UnirestException e) {
      Logger.getAnonymousLogger().log(Level.SEVERE, "Mailgun mail sending failed.");
      e.printStackTrace();
    }
  }

  private void doSend(String to, String subject, String text, String html) throws UnirestException {
    Unirest.post(baseUrl)
            .basicAuth("api", apiKey)
            .queryString("from", mailSender)
            .queryString("to", to)
            .queryString("subject", subject)
            .queryString("text", text)
            .queryString("html", html)
            .asJson();
  }

}
