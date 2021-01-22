package net.feedbacky.app.util.migrator.directive;

import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.logging.Level;

/**
 * @author Plajer
 * <p>
 * Created at 22.01.2021
 */
@Component
public class MailPreferencesDirective extends MigrationDirective {

  private UserRepository userRepository;

  @Autowired
  public MailPreferencesDirective(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public int getMigrationVersion() {
    return 1;
  }

  @Override
  public void doMigrate() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 1 to 2...");
    logger.log(Level.INFO, "It may take some time depending on users amount in database.");
    for(User user : userRepository.findAll()) {
      if(user.getMailPreferences() != null) {
        continue;
      }
      MailPreferences defaultPreferences = new MailPreferences();
      defaultPreferences.setNotificationsEnabled(true);
      defaultPreferences.setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
      defaultPreferences.setUser(user);
      user.setMailPreferences(defaultPreferences);
      userRepository.save(user);
    }
    logger.log(Level.INFO, "Migrated to version 2.");
  }

}
