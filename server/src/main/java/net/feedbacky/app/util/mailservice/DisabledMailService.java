package net.feedbacky.app.util.mailservice;

/**
 * @author Plajer
 * <p>
 * Created at 01.09.2021
 */
public class DisabledMailService implements MailService {

  @Override
  public void send(String to, String subject, String text, String html) {
    return;
  }

}
