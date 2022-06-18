package net.feedbacky.app.repository;

import net.feedbacky.app.data.user.User;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphJpaRepository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Repository
@Table
public interface UserRepository extends EntityGraphJpaRepository<User, Long> {

  @EntityGraph("User.fetch")
  Optional<User> findByEmail(String email);

  Optional<User> findByEmail(String email, com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph entityGraph);

  @EntityGraph("User.fetch")
  Optional<User> findByToken(String token);

  List<User> findByServiceStaffTrue();

  @org.springframework.data.jpa.repository.EntityGraph(value = "User.fetch")
  @Query("SELECT u FROM User u JOIN u.connectedAccounts conn WHERE conn.provider = ?1 AND conn.accountId = ?2")
  Optional<User> findByIntegrationAccount(String provider, String accountId);

}

