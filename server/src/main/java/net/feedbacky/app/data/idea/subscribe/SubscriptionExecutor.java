package net.feedbacky.app.data.idea.subscribe;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailPlaceholderParser;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * @author Plajer
 * <p>
 * Created at 14.05.2020
 */
@Component
public class SubscriptionExecutor {

  private MailHandler mailHandler;

  @Autowired
  public SubscriptionExecutor(MailHandler mailHandler) {
    this.mailHandler = mailHandler;
  }

  public void notifySubscribers(Idea idea, Event event, Map<String, String> data) {
    for(User user : idea.getSubscribers()) {
      boolean shouldNotify = false;
      switch(event) {
        case IDEA_BY_MODERATOR_COMMENT:
          shouldNotify = user.getMailPreferences().isNotifyFromModeratorsComments();
          break;
        case IDEA_STATUS_CHANGE:
          shouldNotify = user.getMailPreferences().isNotifyFromStatusChange();
          break;
        case IDEA_TAGS_CHANGE:
          shouldNotify = user.getMailPreferences().isNotifyFromTagsChange();
          break;
        default:
          break;
      }
      if(!shouldNotify) {
        continue;
      }
      doNotifySubscriber(user, idea, event, data);
    }
  }

  private void doNotifySubscriber(User user, Idea idea, Event event, Map<String, String> data) {
    String subject;
    String text;
    String html;
    MailService.EmailTemplate template;
    String status;
    switch(event) {
      case IDEA_BY_MODERATOR_COMMENT:
        template = MailService.EmailTemplate.SUBSCRIBE_COMMENT;
        subject = template.getSubject();
        text = template.getLegacyText();
        status = data.get(SubscriptionMapData.COMMENT_USER_NAME.getName()) + ": " + data.get(SubscriptionMapData.COMMENT_DESCRIPTION.getName());
        html = MailPlaceholderParser.parseSubscribeStatusPlaceholder(MailPlaceholderParser.parseAllAvailablePlaceholders(template.getHtml(),
                MailService.EmailTemplate.SUBSCRIBE_COMMENT, null, user, null), idea, status);
        break;
      case IDEA_STATUS_CHANGE:
        template = MailService.EmailTemplate.SUBSCRIBE_STATUS_CHANGE;
        subject = template.getSubject();
        text = template.getLegacyText();
        status = "Idea status changed to " + data.get(SubscriptionMapData.NEW_STATUS.getName());
        html = MailPlaceholderParser.parseSubscribeStatusPlaceholder(MailPlaceholderParser.parseAllAvailablePlaceholders(template.getHtml(),
                MailService.EmailTemplate.SUBSCRIBE_STATUS_CHANGE, null, user, null), idea, status);
        break;
      case IDEA_TAGS_CHANGE:
        template = MailService.EmailTemplate.SUBSCRIBE_TAGS_CHANGE;
        subject = template.getSubject();
        text = template.getLegacyText();
        status = data.get(SubscriptionMapData.TAGS_CHANGED.getName());
        html = MailPlaceholderParser.parseSubscribeStatusPlaceholder(MailPlaceholderParser.parseAllAvailablePlaceholders(template.getHtml(),
                MailService.EmailTemplate.SUBSCRIBE_TAGS_CHANGE, null, user, null), idea, status);
        break;
      default:
        return;
    }
    CompletableFuture.runAsync(() -> mailHandler.getMailService().send(user.getEmail(), subject, text, html));
  }

  public enum Event {
    IDEA_BY_MODERATOR_COMMENT, IDEA_STATUS_CHANGE, IDEA_TAGS_CHANGE
  }

  public enum SubscriptionMapData {
    USER_NAME("user_name"), USER_AVATAR("user_avatar"), USER_ID("user_id"), IDEA_NAME("idea_name"),
    IDEA_DESCRIPTION("idea_description"), IDEA_LINK("idea_link"), IDEA_ID("idea_id"),
    COMMENT_DESCRIPTION("comment_description"), COMMENT_ID("comment_id"), COMMENT_USER_NAME("comment_user_name"),
    NEW_STATUS("new_status"), TAGS_CHANGED("tags_changed");

    private String name;

    SubscriptionMapData(String name) {
      this.name = name;
    }

    public String getName() {
      return name;
    }
  }

}
