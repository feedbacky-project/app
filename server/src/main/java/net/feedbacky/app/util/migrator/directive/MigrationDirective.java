package net.feedbacky.app.util.migrator.directive;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Representation of data migration directives.
 *
 * @author Plajer
 * <p>
 * Created at 22.01.2021
 */
public abstract class MigrationDirective {

  protected final Logger logger = Logger.getLogger("Migrator");
  protected int migratedEntries = 0;

  public int getMigrationVersion() {
    return -1;
  }

  public void doMigrate() {
  }

  public void migrateNewEntry() {
    migratedEntries++;
    if(migratedEntries % 50 == 0) {
      logger.log(Level.INFO, "Migrated {0} entries.", migratedEntries);
    }
  }

}
