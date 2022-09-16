package net.feedbacky.app;

import com.cosium.spring.data.jpa.entity.graph.repository.support.EntityGraphJpaRepositoryFactoryBean;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.logging.Level;
import java.util.logging.Logger;

@EnableCaching
@EnableScheduling
@EnableJpaRepositories(repositoryFactoryBeanClass = EntityGraphJpaRepositoryFactoryBean.class)
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class FeedbackyApplication {

  public static final String BACKEND_VERSION = "1.0.0.RC.5";
  private static boolean devMode = false;

  public static void main(String[] args) {
    for(String arg : args) {
      if(arg.equals("devMode")) {
        FeedbackyApplication.devMode = true;
        Logger.getLogger("FeedbackyDev").log(Level.INFO, "Initializing development mode.");
      }
    }
    if(!FeedbackyApplication.devMode && !new StartupValidator().validateStartup()) {
      return;
    }
    SpringApplication app = new SpringApplication(FeedbackyApplication.class);
    if(FeedbackyApplication.devMode) {
      app.setAdditionalProfiles("dev");
    } else {
      app.setAdditionalProfiles("prod");
    }
    app.run(args);
  }

  @Bean
  public boolean isDevelopmentMode() {
    return devMode;
  }

}
