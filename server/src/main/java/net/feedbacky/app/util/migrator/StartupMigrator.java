package net.feedbacky.app.util.migrator;

import net.feedbacky.app.util.migrator.directive.ConnectedAccountsDirective;
import net.feedbacky.app.util.migrator.directive.MailNotificationsDirective;
import net.feedbacky.app.util.migrator.directive.MailPreferencesDirective;
import net.feedbacky.app.util.migrator.directive.MigrationDirective;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
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
  private int version = -1;
  private File versionFile;
  private List<MigrationDirective> migrationDirectives = new ArrayList<>();

  @Autowired
  public StartupMigrator(ApplicationContext context) {
    registerDirectives(context);
  }

  private void registerDirectives(ApplicationContext context) {
    //order does matter with actual migration order
    migrationDirectives.add(context.getBean(MailPreferencesDirective.class));
    migrationDirectives.add(context.getBean(MailNotificationsDirective.class));
    migrationDirectives.add(context.getBean(ConnectedAccountsDirective.class));
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
      for(MigrationDirective directive : migrationDirectives) {
        if(directive.getMigrationVersion() == i) {
          directive.doMigrate();
        }
      }
    }
    saveMigrationFile();
  }

  private void saveMigrationFile() {
    try {
      Files.write(versionFile.toPath(), String.valueOf(FILE_VERSION).getBytes());
    } catch(IOException e) {
      e.printStackTrace();
    }
  }

}
