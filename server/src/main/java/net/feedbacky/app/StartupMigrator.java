package net.feedbacky.app;

import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;
import javax.persistence.Query;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 04.05.2020
 */
@Component
@Order
public class StartupMigrator {

  public static final int FILE_VERSION = 3;
  private final Logger logger = Logger.getLogger("Migrator");
  private final UserRepository userRepository;
  @PersistenceContext(type = PersistenceContextType.EXTENDED)
  private EntityManager entityManager;
  private int version = -1;
  private File versionFile;

  @Autowired
  public StartupMigrator(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @PostConstruct
  public void attemptMigration() {
    versionFile = new File("storage-data" + File.separator + ".version");
    try {
      //migration never happened, create file and start migrating
      if(!versionFile.exists()) {
        versionFile.createNewFile();
        version = 1;
        doAttemptMigration();
        return;
      }
      try(BufferedReader reader = new BufferedReader(new FileReader(versionFile))) {
        String content = reader.readLine();
        if(content == null || content.equals("")) {
          version = FILE_VERSION;
        } else {
          version = Integer.parseInt(content);
        }
      }
    } catch(IOException e) {
      logger.log(Level.WARNING, "Failed to get version file contents! Migrator will not run.");
      e.printStackTrace();
    }
    if(version == FILE_VERSION) {
      return;
    }
    doAttemptMigration();
  }

  private void doAttemptMigration() {
    for(int i = version; i < FILE_VERSION; i++) {
      switch(i) {
        case 2:
          improvedMailNotificationsFeatureMigration();
          break;
        case 1:
          mailPreferencesFeatureMigration();
          break;
        case -1:
          break;
      }
    }
    saveMigrationFile();
  }

  private void improvedMailNotificationsFeatureMigration() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 2 to 3...");
    logger.log(Level.INFO, "It may take some time depending on users amount in database.");
    int affected = 0;
    boolean missingValues = false;
    for(User user : userRepository.findAll()) {
      MailPreferences preferences = user.getMailPreferences();
      if(missingValues) {
        preferences.setNotificationsEnabled(true);
        user.setMailPreferences(preferences);
        userRepository.save(user);
        affected++;
        continue;
      }
      Query query = entityManager.createNativeQuery("SELECT notify_from_moderators_comments, notify_from_status_change, notify_from_tags_change FROM users_mail_preferences WHERE user_id = ?");
      query.setParameter(1, user.getId());
      Object[] result;
      try {
        result = (Object[]) query.getSingleResult();
      } catch(Exception e) {
        logger.log(Level.WARNING, "Encountered SQL exception, probably missing some fields to migrate, switching to non SQL migration.");
        missingValues = true;
        preferences.setNotificationsEnabled(true);
        user.setMailPreferences(preferences);
        userRepository.save(user);
        affected++;
        continue;
      }
      int notificationsEnabledAmount = 0;
      if((boolean) result[0]) {
        notificationsEnabledAmount++;
      }
      if((boolean) result[1]) {
        notificationsEnabledAmount++;
      }
      if((boolean) result[2]) {
        notificationsEnabledAmount++;
      }
      //if 2 out of 3 notification methods are enabled assume that user want to receive future notifications about all types of events
      preferences.setNotificationsEnabled(notificationsEnabledAmount >= 2);
      user.setMailPreferences(preferences);
      userRepository.save(user);
      affected++;
    }
    try {
      entityManager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_moderators_comments").executeUpdate();
      entityManager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_status_change").executeUpdate();
      entityManager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_tags_change").executeUpdate();
    } catch(Exception ignored) {}
    logger.log(Level.INFO, "Migrated to version 3, affected entities: {0}.", affected);
  }

  private void mailPreferencesFeatureMigration() {
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

  private void saveMigrationFile() {
    try {
      Files.write(versionFile.toPath(), String.valueOf(FILE_VERSION).getBytes());
    } catch(IOException e) {
      e.printStackTrace();
    }
  }

}
