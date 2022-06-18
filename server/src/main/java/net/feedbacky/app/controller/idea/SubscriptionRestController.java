package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.idea.subscribe.SubscriptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@CrossOrigin
@RestController
public class SubscriptionRestController {

  private final SubscriptionService subscriptionService;

  @Autowired
  public SubscriptionRestController(SubscriptionService subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  @PostMapping("v1/ideas/{id}/subscribers")
  public FetchUserDto postSubscribe(@PathVariable long id) {
    return subscriptionService.postSubscribe(id);
  }

  @DeleteMapping("v1/ideas/{id}/subscribers")
  public ResponseEntity deleteSubscribe(@PathVariable long id) {
    return subscriptionService.deleteSubscribe(id);
  }

}
