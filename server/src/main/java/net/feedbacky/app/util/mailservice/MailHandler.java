package net.feedbacky.app.util.mailservice;

import lombok.Getter;

import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
@Component
public class MailHandler {

  private String mailServiceType = System.getenv("MAIL_SERVICE_TYPE");
  @Getter private MailService mailService;

  @PostConstruct
  public void init() {
    if(mailServiceType.equalsIgnoreCase("mailgun")) {
      mailService = new MailgunMailService();
    } else if(mailServiceType.equalsIgnoreCase("sendgrid")){
      mailService = new SendGridMailService();
    } else {
      mailService = new SmtpMailService();
    }
  }

}
