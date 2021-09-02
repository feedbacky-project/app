package net.feedbacky.app.util.mailservice;

import lombok.Getter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
@Component
public class MailHandler {

  private final String mailServiceType = System.getenv("MAIL_SERVICE_TYPE");
  @Getter private MailService mailService;
  private boolean mailEnabled = true;

  @Autowired
  public MailHandler(ApplicationContext context) {
    if((boolean) context.getBean("isDevelopmentMode")) {
      mailEnabled = false;
    }
  }

  @PostConstruct
  public void init() {
    if(!mailEnabled) {
      mailService = new DisabledMailService();
      return;
    }
    if(mailServiceType.equalsIgnoreCase("mailgun")) {
      mailService = new MailgunMailService();
    } else if(mailServiceType.equalsIgnoreCase("sendgrid")){
      mailService = new SendGridMailService();
    } else {
      mailService = new SmtpMailService();
    }
  }

}
