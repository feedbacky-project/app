package net.feedbacky.app.data.board.webhook;

import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;

import org.apache.commons.text.StringEscapeUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 24.11.2019
 */
public class WebhookDataBuilder {

  private final Map<String, String> data = new HashMap<>();

  public WebhookDataBuilder withUser(User user) {
    data.put(WebhookExecutor.WebhookMapData.USER_NAME.getName(), user.getUsername());
    data.put(WebhookExecutor.WebhookMapData.USER_AVATAR.getName(), user.getAvatar());
    data.put(WebhookExecutor.WebhookMapData.USER_ID.getName(), String.valueOf(user.getId()));
    return this;
  }

  public WebhookDataBuilder withIdea(Idea idea) {
    data.put(WebhookExecutor.WebhookMapData.IDEA_NAME.getName(), idea.getTitle());
    data.put(WebhookExecutor.WebhookMapData.IDEA_DESCRIPTION.getName(), StringEscapeUtils.unescapeHtml4(idea.getDescription()));
    data.put(WebhookExecutor.WebhookMapData.IDEA_LINK.getName(), idea.toViewLink());
    data.put(WebhookExecutor.WebhookMapData.IDEA_ID.getName(), String.valueOf(idea.getId()));
    return this;
  }

  public WebhookDataBuilder withComment(Comment comment) {
    data.put(WebhookExecutor.WebhookMapData.COMMENT_DESCRIPTION.getName(), StringEscapeUtils.unescapeHtml4(comment.getDescription()));
    data.put(WebhookExecutor.WebhookMapData.COMMENT_ID.getName(), String.valueOf(comment.getId()));
    return this;
  }

  public WebhookDataBuilder withTagsChangedData(String changed) {
    data.put(WebhookExecutor.WebhookMapData.TAGS_CHANGED.getName(), changed);
    return this;
  }

  public WebhookDataBuilder withChangelog(Changelog changelog) {
    data.put(WebhookExecutor.WebhookMapData.CHANGELOG_NAME.getName(), changelog.getTitle());
    data.put(WebhookExecutor.WebhookMapData.CHANGELOG_DESCRIPTION.getName(), changelog.getDescription());
    return this;
  }

  public Map<String, String> build() {
    return data;
  }

}
