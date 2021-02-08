package net.feedbacky.app.util.migrator.directive;

import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.apache.commons.lang3.RandomStringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;
import javax.persistence.Query;

import java.util.logging.Level;

/**
 * @author Plajer
 * <p>
 * Created at 22.01.2021
 */
@Component
public class MailNotificationsDirective extends MigrationDirective {

  private UserRepository userRepository;
  @PersistenceContext(type = PersistenceContextType.EXTENDED)
  private EntityManager entityManager;

  @Autowired
  public MailNotificationsDirective(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public int getMigrationVersion() {
    return 2;
  }

  @Override
  @Transactional
  public void doMigrate() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 2 to 3 (mail notifications revamp)...");
    logger.log(Level.INFO, "It may take some time depending on users amount in database.");
    boolean missingValues = false;
    for(User user : userRepository.findAll(EntityGraphUtils.fromAttributePaths("mailPreferences"))) {
      Hibernate.initialize(user.getMailPreferences());
      MailPreferences preferences = user.getMailPreferences();
      if(preferences == null) {
        logger.log(Level.WARNING, "Mail preferences missing for " + user.getId());
        preferences = new MailPreferences();
        preferences.setUser(user);
        preferences.setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
        preferences.setNotificationsEnabled(false);
        user.setMailPreferences(preferences);
        userRepository.save(user);
        continue;
      }
      if(missingValues) {
        preferences.setNotificationsEnabled(true);
        user.setMailPreferences(preferences);
        userRepository.save(user);
        super.migrateNewEntry();
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
        super.migrateNewEntry();
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
      super.migrateNewEntry();
    }
    try {
      EntityManager manager = entityManager.getEntityManagerFactory().createEntityManager();
      manager.getTransaction().begin();
      manager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_moderators_comments").executeUpdate();
      manager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_status_change").executeUpdate();
      manager.createNativeQuery("ALTER TABLE users_mail_preferences DROP notify_from_tags_change").executeUpdate();
      manager.getTransaction().commit();
    } catch(Exception ignored) {
    }
    logger.log(Level.INFO, "Migrated to version 3 (mail notification revamp).");
  }
}
