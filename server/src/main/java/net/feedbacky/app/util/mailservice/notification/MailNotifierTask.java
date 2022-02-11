package net.feedbacky.app.util.mailservice.notification;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.subscribe.NotificationEvent;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2021
 */
@Component
public class MailNotifierTask {

  private final Logger logger = Logger.getLogger("MailService");
  private MailHandler mailHandler;
  private SubscriptionExecutor subscriptionExecutor;

  @Autowired
  public MailNotifierTask(MailHandler mailHandler, SubscriptionExecutor subscriptionExecutor) {
    this.mailHandler = mailHandler;
    this.subscriptionExecutor = subscriptionExecutor;
  }

  @Scheduled(fixedRate = 1000 * 60 * 5 /* 5 minutes */)
  private void sendNotificationMailsTask() {
    if(subscriptionExecutor.getNotificationBuffer().isEmpty()) {
      return;
    }
    int entries = subscriptionExecutor.getNotificationBuffer().size();
    int condensedNotifications = 0;
    for(Map.Entry<User, List<NotificationEvent>> entry : subscriptionExecutor.getNotificationBuffer().entrySet()) {
      User user = entry.getKey();
      MailNotificationBuilder builder = new MailNotificationBuilder();
      for(NotificationEvent event : entry.getValue()) {
        String status;
        Idea idea;
        switch(event.getEventType()) {
          case IDEA_BY_MODERATOR_COMMENT:
            Comment comment = (Comment) event.getObject();
            builder = builder.withIdeaCommentedByModerator(comment);
            break;
          case IDEA_STATUS_CHANGE:
            idea = (Idea) event.getObject();
            status = "Idea status changed to " + event.getContent();
            builder = builder.withIdeaStatusChange(idea, status);
            break;
          case IDEA_TAGS_CHANGE:
            idea = (Idea) event.getObject();
            status = event.getContent();
            builder = builder.withIdeaTagsChange(idea, status);
            break;
          default:
            break;
        }
        condensedNotifications++;
      }
      builder.build()
              .withTemplate(MailService.EmailTemplate.SUBSCRIBE_NOTIFICATION)
              .withRecipient(user)
              .sendMail(mailHandler.getMailService())
              .async();
    }
    subscriptionExecutor.emptyNotificationBuffer();
    logger.log(Level.INFO, "Cleaned notifications buffer, sent " + entries + " mails condensed from " + condensedNotifications + " entries.");
  }

}
