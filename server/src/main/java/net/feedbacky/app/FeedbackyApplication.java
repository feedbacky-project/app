package net.feedbacky.app;

import com.cosium.spring.data.jpa.entity.graph.repository.support.EntityGraphJpaRepositoryFactoryBean;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableCaching
@EnableScheduling
@EnableJpaRepositories(repositoryFactoryBeanClass = EntityGraphJpaRepositoryFactoryBean.class)
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class FeedbackyApplication {

  public static final String BACKEND_VERSION = "1.0.0.alpha.5";

  public static void main(String[] args) {
    if(!new StartupValidator().validateStartup()) {
      return;
    }
    SpringApplication.run(FeedbackyApplication.class, args);
  }

}
