package net.feedbacky.app.service;

import lombok.RequiredArgsConstructor;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.rest.data.user.User;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Service
@RequiredArgsConstructor
public class FeedbackyUserDetailsService {

  private UserRepository userRepository;

  public ServiceUser loadUserByEmail(String email) throws UsernameNotFoundException {
    Optional<User> optional = userRepository.findByEmail(email);
    if(!optional.isPresent()) {
      throw new UsernameNotFoundException("User not found with email: " + email);
    }
    User user = optional.get();
    return new ServiceUser(user.getUsername(), user.getEmail(), new ArrayList<>());
  }

}
