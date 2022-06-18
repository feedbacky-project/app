package net.feedbacky.app.service.idea.subscribe;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@Service
public class SubscriptionServiceImpl implements SubscriptionService {

  private final IdeaRepository ideaRepository;
  private final UserRepository userRepository;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  public SubscriptionServiceImpl(IdeaRepository ideaRepository, UserRepository userRepository, TriggerExecutor triggerExecutor) {
    this.ideaRepository = ideaRepository;
    this.userRepository = userRepository;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public FetchUserDto postSubscribe(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(idea.getSubscribers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already subscribed.");
    }
    Set<User> subscribers = idea.getSubscribers();
    subscribers.add(user);
    idea.setSubscribers(subscribers);
    ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_SUBSCRIBE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    return user.toDto();
  }

  @Override
  public ResponseEntity deleteSubscribe(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getSubscribers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet subscribed.");
    }
    Set<User> subscribers = idea.getSubscribers();
    subscribers.remove(user);
    idea.setSubscribers(subscribers);
    ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_UNSUBSCRIBE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    //no need to expose
    return ResponseEntity.noContent().build();
  }
}
