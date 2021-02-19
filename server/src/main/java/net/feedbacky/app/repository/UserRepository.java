package net.feedbacky.app.repository;

import net.feedbacky.app.data.user.User;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph;
import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphJpaRepository;

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

  Optional<User> findByEmail(String email);

  Optional<User> findByEmail(String email, EntityGraph entityGraph);

  Optional<User> findByToken(String token);

  List<User> findByServiceStaffTrue();

}

