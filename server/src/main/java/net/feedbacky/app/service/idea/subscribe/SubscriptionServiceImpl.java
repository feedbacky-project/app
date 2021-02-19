package net.feedbacky.app.service.idea.subscribe;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@Service
public class SubscriptionServiceImpl implements SubscriptionService {

  private final IdeaRepository ideaRepository;
  private final UserRepository userRepository;

  @Autowired
  public SubscriptionServiceImpl(IdeaRepository ideaRepository, UserRepository userRepository) {
    this.ideaRepository = ideaRepository;
    this.userRepository = userRepository;
  }

  @Override
  public FetchUserDto postSubscribe(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(idea.getSubscribers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already subscribed.");
    }
    idea.getSubscribers().add(user);
    ideaRepository.save(idea);
    return new FetchUserDto().from(user);
  }

  @Override
  public ResponseEntity deleteSubscribe(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getSubscribers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet subscribed.");
    }
    idea.getSubscribers().remove(user);
    ideaRepository.save(idea);
    //no need to expose
    return ResponseEntity.noContent().build();
  }
}
