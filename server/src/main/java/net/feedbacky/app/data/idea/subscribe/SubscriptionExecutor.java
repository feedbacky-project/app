package net.feedbacky.app.data.idea.subscribe;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailHandler;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
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
@Deprecated //recoding compoment
public class SubscriptionExecutor {

  private final MailHandler mailHandler;
  private Map<User, List<Pair<Event, Map<String, String>>>> notificationBuffer = new HashMap<>();

  @Autowired
  public SubscriptionExecutor(MailHandler mailHandler) {
    this.mailHandler = mailHandler;
  }

  public void notifySubscribers(Idea idea, Event event, Map<String, String> data) {
    for(User user : idea.getSubscribers()) {
      if(!user.getMailPreferences().isNotificationsEnabled()) {
        continue;
      }
      doNotifySubscriber(user, event, data);
    }
  }

  private void doNotifySubscriber(User user, Event event, Map<String, String> data) {
    List<Pair<Event, Map<String, String>>> incomingNotifications = notificationBuffer.getOrDefault(user, new ArrayList<>());
    incomingNotifications.add(Pair.of(event, data));
    notificationBuffer.put(user, incomingNotifications);
  }

  public Map<User, List<Pair<Event, Map<String, String>>>> getNotificationBuffer() {
    return notificationBuffer;
  }

  public void emptyNotificationBuffer() {
    notificationBuffer.clear();
  }

  public enum Event {
    IDEA_BY_MODERATOR_COMMENT, IDEA_STATUS_CHANGE, IDEA_TAGS_CHANGE
  }

  public enum SubscriptionMapData {
    USER_NAME("user_name"), USER_AVATAR("user_avatar"), USER_ID("user_id"), IDEA_NAME("idea_name"),
    IDEA_DESCRIPTION("idea_description"), IDEA_LINK("idea_link"), IDEA_ID("idea_id"),
    COMMENT_DESCRIPTION("comment_description"), COMMENT_ID("comment_id"), COMMENT_USER_NAME("comment_user_name"),
    COMMENT_USER_AVATAR("comment_user_avatar"),
    NEW_STATUS("new_status"), TAGS_CHANGED("tags_changed");

    private final String name;

    SubscriptionMapData(String name) {
      this.name = name;
    }

    public String getName() {
      return name;
    }
  }

}
