package net.feedbacky.app.repository;

import java.util.Optional;

import net.feedbacky.app.rest.data.user.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

}
