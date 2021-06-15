package net.feedbacky.app.util.migrator.directive;

import net.feedbacky.app.data.user.ConnectedAccount;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;
import javax.persistence.Query;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;

/**
 * @author Plajer
 * <p>
 * Created at 22.01.2021
 */
@Component
public class ConnectedAccountsDirective extends MigrationDirective<User> {

  private UserRepository userRepository;
  @PersistenceContext(type = PersistenceContextType.EXTENDED)
  private EntityManager entityManager;

  private boolean missingValues = false;

  @Autowired
  public ConnectedAccountsDirective(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public int getMigrationVersion() {
    return 2;
  }

  @Override
  @Transactional
  public void doMigrate() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 2 to 3 (connected accounts revamp)...");
    logger.log(Level.INFO, "It may take some time depending on users amount in database.");
    List<User> migratedUsers = new ArrayList<>();
    for(User user : userRepository.findAll(EntityGraphUtils.fromAttributePaths("connectedAccounts"))) {
      if(this.missingValues) {
        continue;
      }
      try {
        migrateEntry(user);
        migratedUsers.add(user);
      } catch(Exception ex) {
        logger.log(Level.WARNING, "[EX1] Encountered unknown exception while migrating user with id " + user.getId() + ", skipping entry...");
      }
    }
    userRepository.saveAll(migratedUsers);
    logger.log(Level.INFO, "Migrated to version 3 (connected accounts revamp).");
  }

  public void migrateEntry(User user) {
    Query query = entityManager.createNativeQuery("SELECT data, type, id FROM users_connected_accounts WHERE user_id = ?");
    query.setParameter(1, user.getId());
    List<Object[]> result;
    try {
      result = (List<Object[]>) query.getResultList();
    } catch(Exception e) {
      this.missingValues = true;
      logger.log(Level.WARNING, "[EX2] Encountered SQL exception, probably missing some fields to migrate, switching to non SQL migration.");
      return;
    }
    Set<ConnectedAccount> updatedAccounts = new HashSet<>();
    for(Object[] object : result) {
      String data = (String) object[0];
      int type = (int) object[1];
      BigInteger id = (BigInteger) object[2];
      String provider;
      switch(type) {
        case 0:
          provider = "discord";
          break;
        case 1:
          provider = "github";
          break;
        case 2:
          provider = "google";
          break;
        default:
          logger.log(Level.WARNING, "[EX3] Invalid provider type " + type + " for user id " + user.getId() + ", skipping.");
          continue;
      }
      try {
        JsonNode node = new ObjectMapper().readTree(data);
        Hibernate.initialize(user.getConnectedAccounts());
        for(ConnectedAccount account : user.getConnectedAccounts()) {
          if(account.getId() != id.longValue()) {
            continue;
          }
          String accountId;
          switch(provider) {
            case "discord":
              accountId = node.get("SNOWFLAKE").asText();
              break;
            case "github":
              accountId = node.get("GITHUB_UID").asText();
              break;
            case "google":
              accountId = node.get("GOOGLE_UID").asText();
              break;
            default:
              continue;
          }
          account.setAccountId(String.valueOf(accountId));
          account.setProvider(provider);
          updatedAccounts.add(account);
          super.migrationSuccess();
        }
      } catch(Exception e) {
        logger.log(Level.WARNING, "[EX4] Failed to process data for user id " + user.getId() + ", skipping.");
        continue;
      }
      user.setConnectedAccounts(updatedAccounts);
    }
  }

}
