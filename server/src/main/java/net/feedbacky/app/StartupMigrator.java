package net.feedbacky.app;

import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
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
      String content = new String(Files.readAllBytes(versionFile.toPath()), StandardCharsets.UTF_8);
      version = parseIntOrDefault(content, FILE_VERSION);
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
    int affected = 0;
    for(User user : userRepository.findAll()) {
      int notificationsEnabledAmount = 0;
      MailPreferences preferences = user.getMailPreferences();
      if(preferences.isNotifyFromModeratorsComments()) {
        notificationsEnabledAmount++;
      }
      if(preferences.isNotifyFromStatusChange()) {
        notificationsEnabledAmount++;
      }
      if(preferences.isNotifyFromTagsChange()) {
        notificationsEnabledAmount++;
      }
      //if 2 out of 3 notification methods are enabled assume that user want to receive future notifications about all types of events
      if(notificationsEnabledAmount >= 2) {
        preferences.setNotificationsEnabled(true);
        user.setMailPreferences(preferences);
        userRepository.save(user);
        affected++;
      }
    }
    logger.log(Level.INFO, "Migrated to version 3, affected entities: {0}.", affected);
  }

  private void mailPreferencesFeatureMigration() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 1 to 2...");
    for(User user : userRepository.findAll()) {
      if(user.getMailPreferences() != null) {
        continue;
      }
      MailPreferences defaultPreferences = new MailPreferences();
      defaultPreferences.setNotifyFromModeratorsComments(true);
      defaultPreferences.setNotifyFromStatusChange(true);
      defaultPreferences.setNotifyFromTagsChange(true);
      defaultPreferences.setNotificationsEnabled(true);
      defaultPreferences.setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
      defaultPreferences.setUser(user);
      user.setMailPreferences(defaultPreferences);
      userRepository.save(user);
    }
    logger.log(Level.INFO, "Migrated to version 2.");
  }

  private void saveMigrationFile() {
    try(PrintStream out = new PrintStream(versionFile)) {
      out.print(FILE_VERSION + "");
    } catch(FileNotFoundException e) {
      e.printStackTrace();
    }
  }

  private int parseIntOrDefault(String string, int defaultValue) {
    if(string.equals("")) {
      return defaultValue;
    }
    try {
      return Integer.parseInt(string);
    } catch(Exception ex) {
      return defaultValue;
    }
  }

}
