package net.feedbacky.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class FeedbackyApplication {

  public static void main(String[] args) {
    SpringApplication.run(FeedbackyApplication.class, args);
  }

}
