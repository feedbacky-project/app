package net.feedbacky.app.util.mailservice;

import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
public class SmtpMailService implements MailService {

  private static String smtpUsername = System.getenv("MAIL_SMTP_USERNAME");
  private static String smtpPassword = System.getenv("MAIL_SMTP_PASSWORD");
  private static String smtpHost = System.getenv("MAIL_SMTP_HOST");
  private static String smtpPort = System.getenv("MAIL_SMTP_PORT");
  private static String mailSender = System.getenv("MAIL_SENDER");
  private Properties properties;

  public SmtpMailService() {
    properties = System.getProperties();
    properties.put("mail.smtp.host", smtpHost);
    properties.put("mail.smtp.auth", "true");
    properties.put("mail.smtp.port", smtpPort);
  }

  @Override
  public void send(String to, String subject, String text, String html) {
    try {
      doSend(to, subject, text, html);
    } catch(MessagingException e) {
      Logger.getAnonymousLogger().log(Level.SEVERE, "Smtp mail sending failed.");
      e.printStackTrace();
    }
  }

  private void doSend(String to, String subject, String text, String html) throws MessagingException {
    Session session = Session.getInstance(properties, new Authenticator() {
      @Override
      protected PasswordAuthentication getPasswordAuthentication() {
        return new PasswordAuthentication(smtpUsername, smtpPassword);
      }
    });
    Message message = new MimeMessage(session);

    message.setFrom(new InternetAddress(mailSender));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to, false));
    message.setSubject(subject);

    Multipart multipart = new MimeMultipart();
    BodyPart bodyPart = new MimeBodyPart();
    bodyPart.setText(text);
    multipart.addBodyPart(bodyPart);

    BodyPart htmlBodyPart = new MimeBodyPart();
    htmlBodyPart.setContent(html, "text/html; charset=UTF-8");
    multipart.addBodyPart(htmlBodyPart);

    message.setContent(multipart);
    Transport.send(message);
  }

}
