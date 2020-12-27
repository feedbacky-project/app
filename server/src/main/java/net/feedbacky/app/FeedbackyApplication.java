package net.feedbacky.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class FeedbackyApplication {

  public static final String BACKEND_VERSION = "0.5.0-beta";

  public static void main(String[] args) {
    if(!new StartupValidator().validateStartup()) {
      return;
    }
    SpringApplication.run(FeedbackyApplication.class, args);
  }

}
