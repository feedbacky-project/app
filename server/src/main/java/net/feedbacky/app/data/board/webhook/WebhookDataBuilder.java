package net.feedbacky.app.data.board.webhook;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
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

  private final Map<WebhookExecutor.WebhookDataObjects, Object> data = new HashMap<>();

  public WebhookDataBuilder withUser(User user) {
    data.put(WebhookExecutor.WebhookDataObjects.USER, user);
    return this;
  }

  public WebhookDataBuilder withIdea(Idea idea) {
    data.put(WebhookExecutor.WebhookDataObjects.IDEA, idea);
    return this;
  }

  public WebhookDataBuilder withComment(Comment comment) {
    data.put(WebhookExecutor.WebhookDataObjects.COMMENT, comment);
    return this;
  }

  public WebhookDataBuilder withCommentReaction(CommentReaction reaction) {
    data.put(WebhookExecutor.WebhookDataObjects.COMMENT_REACTION, reaction);
    return this;
  }

  public WebhookDataBuilder withChangelog(Changelog changelog) {
    data.put(WebhookExecutor.WebhookDataObjects.CHANGELOG, changelog);
    return this;
  }

  public WebhookDataBuilder withChangelogReaction(ChangelogReaction reaction) {
    data.put(WebhookExecutor.WebhookDataObjects.CHANGELOG_REACTION, reaction);
    return this;
  }

  public WebhookDataBuilder withBoard(Board board) {
    data.put(WebhookExecutor.WebhookDataObjects.BOARD, board);
    return this;
  }

  public WebhookDataBuilder withSuspendedUser(SuspendedUser suspendedUser) {
    data.put(WebhookExecutor.WebhookDataObjects.SUSPENDED_USER, suspendedUser);
    return this;
  }

  public WebhookDataBuilder withModerator(Moderator moderator) {
    data.put(WebhookExecutor.WebhookDataObjects.MODERATOR, moderator);
    return this;
  }

  public Map<WebhookExecutor.WebhookDataObjects, Object> build() {
    return data;
  }

}
