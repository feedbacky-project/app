package net.feedbacky.app.util.migrator.directive;

import net.feedbacky.app.data.user.ConnectedAccount;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceContextType;
import javax.persistence.Query;

import java.math.BigInteger;
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
public class ConnectedAccountsDirective extends MigrationDirective {

  private UserRepository userRepository;
  @PersistenceContext(type = PersistenceContextType.EXTENDED)
  private EntityManager entityManager;

  @Autowired
  public ConnectedAccountsDirective(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public int getMigrationVersion() {
    return 2;
  }

  @Override
  public void doMigrate() {
    logger.log(Level.INFO, "Migrating Feedbacky from version 2 to 3 (connected accounts revamp)...");
    logger.log(Level.INFO, "It may take some time depending on users amount in database.");
    boolean missingValues = false;
    for(User user : userRepository.findAll()) {
      if(missingValues) {
        continue;
      }
      Query query = entityManager.createNativeQuery("SELECT data, type, id FROM users_connected_accounts WHERE user_id = ?");
      query.setParameter(1, user.getId());
      List<Object[]> result;
      try {
        result = (List<Object[]>) query.getResultList();
      } catch(Exception e) {
        missingValues = true;
        logger.log(Level.WARNING, "Encountered SQL exception, probably missing some fields to migrate, switching to non SQL migration.");
        continue;
      }
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
            logger.log(Level.WARNING, "Invalid provider type " + type + " for user id " + user.getId() + ", skipping.");
            continue;
        }
        try {
          JsonNode node = new ObjectMapper().readTree(data);
          Set<ConnectedAccount> updatedAccounts = new HashSet<>();
          for(ConnectedAccount account : user.getConnectedAccounts()) {
            if(account.getId() != id.longValue()) {
              continue;
            }
            long accountId;
            switch(provider) {
              case "discord":
                accountId = node.get("SNOWFLAKE").asLong();
                break;
              case "github":
                accountId = node.get("GITHUB_UID").asLong();
                break;
              case "google":
                accountId = node.get("GOOGLE_UID").asLong();
                break;
              default:
                continue;
            }
            account.setAccountId(accountId);
            account.setProvider(provider);
            updatedAccounts.add(account);
          }
          user.setConnectedAccounts(updatedAccounts);
          userRepository.save(user);
        } catch(JsonProcessingException e) {
          logger.log(Level.WARNING, "Failed to process data for user id " + user.getId() + ", skipping.");
          continue;
        }
      }
    }
    logger.log(Level.INFO, "Migrated to version 3 (connected accounts revamp).");
  }

}
