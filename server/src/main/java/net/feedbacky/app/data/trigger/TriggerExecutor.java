package net.feedbacky.app.data.trigger;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.integration.IntegrationExecutor;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.board.webhook.WebhookExecutor;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Component
public class TriggerExecutor {

  private final WebhookExecutor webhookExecutor;
  private final IntegrationExecutor integrationExecutor;

  @Autowired
  public TriggerExecutor(WebhookExecutor webhookExecutor, IntegrationExecutor integrationExecutor) {
    this.webhookExecutor = webhookExecutor;
    this.integrationExecutor = integrationExecutor;
  }

  public void executeTrigger(ActionTrigger trigger) {
    notifyWebhooks(trigger);
    integrationExecutor.notifyIntegrations(trigger);
  }

  private void notifyWebhooks(ActionTrigger trigger) {
    for(Webhook webhook : trigger.getTriggeredBoard().getWebhooks()) {
      if(!webhook.getTriggers().contains(trigger.getTrigger())) {
        continue;
      }
      notifySingleWebhook(trigger, webhook);
    }
  }

  private void notifySingleWebhook(ActionTrigger trigger, Webhook webhook) {
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(trigger.getTriggerer());
    switch(trigger.getTrigger()) {
      case IDEA_CREATE:
      case IDEA_DELETE:
      case IDEA_EDIT:
      case IDEA_CLOSE:
      case IDEA_OPEN:
      case IDEA_TAGS_CHANGE:
      case IDEA_ASSIGN:
      case IDEA_UNASSIGN:
      case IDEA_COMMENTS_ENABLE:
      case IDEA_COMMENTS_DISABLE:
      case IDEA_PIN:
      case IDEA_UNPIN:
      case IDEA_VOTES_RESET:
      case IDEA_UPVOTE:
      case IDEA_UNDO_UPVOTE:
      case IDEA_ATTACHMENT_UPDATE:
      case IDEA_SUBSCRIBE:
      case IDEA_UNSUBSCRIBE:
      case INTEGRATION_GITHUB_IDEA_CONVERT:
        builder = builder.withIdea((Idea) getObjectFromTrigger(trigger, Idea.class));
        break;
      case COMMENT_CREATE:
      case COMMENT_DELETE:
      case COMMENT_EDIT:
        builder = builder
                .withComment((Comment) getObjectFromTrigger(trigger, Comment.class))
                .withIdea(((Comment) getObjectFromTrigger(trigger, Comment.class)).getIdea());
        break;
      case COMMENT_REACT:
      case COMMENT_UNREACT:
        builder = builder
                .withComment((Comment) getObjectFromTrigger(trigger, Comment.class))
                .withIdea(((Comment) getObjectFromTrigger(trigger, Comment.class)).getIdea())
                .withCommentReaction((CommentReaction) getObjectFromTrigger(trigger, CommentReaction.class));
        break;
      case CHANGELOG_CREATE:
      case CHANGELOG_DELETE:
      case CHANGELOG_EDIT:
        builder = builder.withChangelog((Changelog) getObjectFromTrigger(trigger, Changelog.class));
        break;
      case CHANGELOG_REACT:
      case CHANGELOG_UNREACT:
        builder = builder
                .withChangelog((Changelog) getObjectFromTrigger(trigger, Changelog.class))
                .withChangelogReaction((ChangelogReaction) getObjectFromTrigger(trigger, ChangelogReaction.class));
        break;
      case BOARD_USER_SUSPENSION:
      case BOARD_USER_UNSUSPENSION:
        builder = builder
                .withBoard((Board) getObjectFromTrigger(trigger, Board.class))
                .withSuspendedUser((SuspendedUser) getObjectFromTrigger(trigger, SuspendedUser.class));
        break;
      case BOARD_MODERATOR_ADDED:
      case BOARD_MODERATOR_REMOVED:
      case BOARD_MODERATOR_PROMOTED:
      case BOARD_MODERATOR_DEMOTED:
        builder = builder
                .withBoard((Board) getObjectFromTrigger(trigger, Board.class))
                .withModerator((Moderator) getObjectFromTrigger(trigger, Moderator.class));
        break;
      case BOARD_SETTINGS_EDIT:
      case BOARD_DELETE:
        //trigger test has default board properties
        builder = builder.withBoard((Board) getObjectFromTrigger(trigger, Board.class));
        break;
      default:
        throw new UnsupportedOperationException("Invalid trigger " + trigger);
    }
    webhookExecutor.executeWebhook(webhook, trigger, builder.build());
  }

  private <T> Object getObjectFromTrigger(ActionTrigger trigger, T clazz) {
    for(Object obj : trigger.getRelatedObjects()) {
      if(obj.getClass().equals(clazz)) {
        return (T) obj;
      }
    }
    throw new IllegalArgumentException(clazz.getClass().getName() + " not found in provided trigger.");
  }

}
