package net.feedbacky.app.service;

import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Service
public class FeedbackyUserDetailsService {

  private final UserRepository userRepository;

  @Autowired
  public FeedbackyUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public ServiceUser loadUserByEmail(String email) throws UsernameNotFoundException {
    Optional<User> optional = userRepository.findByEmail(email);
    if(!optional.isPresent()) {
      throw new UsernameNotFoundException(MessageFormat.format("User with email {0} not found.", email));
    }
    User user = optional.get();
    return new ServiceUser(user.getUsername(), user.getEmail(), new ArrayList<>());
  }

}
