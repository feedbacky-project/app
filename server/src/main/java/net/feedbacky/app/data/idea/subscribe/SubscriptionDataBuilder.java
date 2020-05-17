package net.feedbacky.app.data.idea.subscribe;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailService;

import org.apache.commons.text.StringEscapeUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 14.05.2020
 */
public class SubscriptionDataBuilder {

  private Map<String, String> data = new HashMap<>();

  public SubscriptionDataBuilder withUser(User user) {
    data.put(SubscriptionExecutor.SubscriptionMapData.USER_NAME.getName(), user.getUsername());
    data.put(SubscriptionExecutor.SubscriptionMapData.USER_AVATAR.getName(), user.getAvatar());
    data.put(SubscriptionExecutor.SubscriptionMapData.USER_ID.getName(), String.valueOf(user.getId()));
    return this;
  }

  public SubscriptionDataBuilder withIdea(Idea idea) {
    data.put(SubscriptionExecutor.SubscriptionMapData.IDEA_NAME.getName(), idea.getTitle());
    data.put(SubscriptionExecutor.SubscriptionMapData.IDEA_DESCRIPTION.getName(), StringEscapeUtils.unescapeHtml4(idea.getDescription()));
    data.put(SubscriptionExecutor.SubscriptionMapData.IDEA_LINK.getName(), MailService.HOST_ADDRESS + "/i/" + idea.getId());
    data.put(SubscriptionExecutor.SubscriptionMapData.IDEA_ID.getName(), String.valueOf(idea.getId()));
    data.put(SubscriptionExecutor.SubscriptionMapData.NEW_STATUS.getName(), idea.getStatus().name());
    return this;
  }

  public SubscriptionDataBuilder withComment(Comment comment) {
    data.put(SubscriptionExecutor.SubscriptionMapData.COMMENT_DESCRIPTION.getName(), StringEscapeUtils.unescapeHtml4(comment.getDescription()));
    data.put(SubscriptionExecutor.SubscriptionMapData.COMMENT_ID.getName(), String.valueOf(comment.getId()));
    data.put(SubscriptionExecutor.SubscriptionMapData.COMMENT_USER_NAME.getName(), comment.getCreator().getUsername());
    data.put(SubscriptionExecutor.SubscriptionMapData.COMMENT_USER_AVATAR.getName(), comment.getCreator().getAvatar());
    return this;
  }

  public SubscriptionDataBuilder withTagsChangedData(String changed) {
    data.put(SubscriptionExecutor.SubscriptionMapData.TAGS_CHANGED.getName(), changed);
    return this;
  }

  public Map<String, String> build() {
    return data;
  }

}
