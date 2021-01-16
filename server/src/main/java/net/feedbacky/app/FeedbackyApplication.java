package net.feedbacky.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableCaching
@EnableScheduling
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class FeedbackyApplication {

  public static final String BACKEND_VERSION = "0.6.0-beta";

  public static void main(String[] args) {
    if(!new StartupValidator().validateStartup()) {
      return;
    }
    SpringApplication.run(FeedbackyApplication.class, args);
  }

}
