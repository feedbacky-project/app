package net.feedbacky.app.data.idea.subscribe;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.user.User;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 14.05.2020
 */
@Component
public class SubscriptionExecutor {

  private Map<User, List<NotificationEvent>> notificationBuffer = new HashMap<>();

  public void notifySubscribers(Idea idea, NotificationEvent event) {
    for(User user : idea.getSubscribers()) {
      if(!user.getMailPreferences().isNotificationsEnabled()) {
        continue;
      }
      //do not notify creator of idea if he made any changes to the idea
      if(user.equals(event.getSource()) && idea.getCreator().equals(event.getSource())) {
        continue;
      }
      doNotifySubscriber(user, event);
    }
  }

  private void doNotifySubscriber(User user, NotificationEvent event) {
    List<NotificationEvent> incomingNotifications = notificationBuffer.getOrDefault(user, new ArrayList<>());
    incomingNotifications.add(event);
    notificationBuffer.put(user, incomingNotifications);
  }

  public Map<User, List<NotificationEvent>> getNotificationBuffer() {
    return notificationBuffer;
  }

  public void emptyNotificationBuffer() {
    notificationBuffer.clear();
  }

  public enum Event {
    IDEA_BY_MODERATOR_COMMENT, IDEA_STATUS_CHANGE, IDEA_TAGS_CHANGE
  }

}
