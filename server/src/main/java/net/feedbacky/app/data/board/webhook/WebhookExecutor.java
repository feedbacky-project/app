package net.feedbacky.app.data.board.webhook;

import lombok.Getter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.MessageFormat;
import java.util.Calendar;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 24.11.2019
 */
@Component
public class WebhookExecutor {

  public void executeWebhook(Webhook webhook, ActionTrigger trigger, Map<WebhookDataObjects, Object> data) {
    switch(webhook.getType()) {
      case CUSTOM_ENDPOINT:
        executeCustomEndpoint(webhook, trigger, data);
        return;
      case DISCORD:
        executeDiscordEndpoint(webhook, trigger, data);
        return;
    }
    return;
  }

  private void executeCustomEndpoint(Webhook webhook, ActionTrigger trigger, Map<WebhookDataObjects, Object> data) {
    //todo
    return;
  }

  private void executeDiscordEndpoint(Webhook webhook, ActionTrigger trigger, Map<WebhookDataObjects, Object> data) {
    DiscordWebhook client = new DiscordWebhook(webhook.getUrl());
    Board board = webhook.getBoard();
    client.setAvatarUrl(board.getLogo());
    client.setUsername(board.getName());
    DiscordWebhook.EmbedObject embedBuilder = getEmbedFromTrigger(trigger, data);
    embedBuilder.setTimestamp(new Timestamp(Calendar.getInstance().getTime().getTime()));
    client.addEmbed(embedBuilder);
    CompletableFuture.runAsync(() -> {
      try {
        client.execute();
      } catch(IOException ex) {
        ex.printStackTrace();
      }
    });
  }

  //suppress NullPointerException warnings, we can safely assume that ActionTrigger contains particular objects for particular Trigger types
  @SuppressWarnings("ConstantConditions")
  public DiscordWebhook.EmbedObject getEmbedFromTrigger(ActionTrigger trigger, Map<WebhookExecutor.WebhookDataObjects, Object> data) {
    DiscordWebhook.EmbedObject embedBuilder = new DiscordWebhook.EmbedObject()
            .setColor(Color.decode(trigger.getTriggeredBoard().getThemeColor()));

    Idea idea = data.containsKey(WebhookExecutor.WebhookDataObjects.IDEA) ? ((Idea) data.get(WebhookExecutor.WebhookDataObjects.IDEA)) : null;
    Changelog changelog = data.containsKey(WebhookExecutor.WebhookDataObjects.CHANGELOG) ? ((Changelog) data.get(WebhookExecutor.WebhookDataObjects.CHANGELOG)) : null;
    ChangelogReaction changelogReaction = data.containsKey(WebhookExecutor.WebhookDataObjects.CHANGELOG_REACTION) ? ((ChangelogReaction) data.get(WebhookExecutor.WebhookDataObjects.CHANGELOG_REACTION)) : null;
    Comment comment = data.containsKey(WebhookExecutor.WebhookDataObjects.COMMENT) ? ((Comment) data.get(WebhookExecutor.WebhookDataObjects.COMMENT)) : null;
    CommentReaction commentReaction = data.containsKey(WebhookExecutor.WebhookDataObjects.COMMENT_REACTION) ? ((CommentReaction) data.get(WebhookExecutor.WebhookDataObjects.COMMENT_REACTION)) : null;
    SuspendedUser suspendedUser = data.containsKey(WebhookDataObjects.SUSPENDED_USER) ? ((SuspendedUser) data.get(WebhookExecutor.WebhookDataObjects.SUSPENDED_USER)) : null;
    Moderator moderator = data.containsKey(WebhookDataObjects.MODERATOR) ? ((Moderator) data.get(WebhookDataObjects.MODERATOR)) : null;
    Board board = trigger.getTriggeredBoard();
    User triggerer = trigger.getTriggerer();

    switch(trigger.getTrigger()) {
      case IDEA_CREATE:
        embedBuilder
                .setTitle("New Idea Posted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", idea.getTitle(), idea.getDescription()))
                .setUrl(idea.toViewLink())
                .setFooter("Posted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_DELETE:
        embedBuilder
                .setTitle("Idea Deleted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", idea.getTitle(), idea.getDescription()))
                //board link because idea no longer exists
                .setUrl(board.toViewLink())
                .setFooter("Deleted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_EDIT:
        embedBuilder
                .setTitle("Idea Edited - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", idea.getTitle(), idea.getDescription()))
                .setUrl(idea.toViewLink())
                .setFooter("Edited by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_CLOSE:
        embedBuilder
                .setTitle("Idea Closed - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Closed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_OPEN:
        embedBuilder
                .setTitle("Idea Opened - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Opened by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_TAGS_CHANGE:
        embedBuilder
                .setTitle("Tags of Idea Changed - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`New Tags`**\n{0}", idea.getTags().stream().map(Tag::getName).collect(Collectors.joining(", "))))
                .setUrl(idea.toViewLink())
                .setFooter("Edited by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_ASSIGN:
        embedBuilder
                .setTitle("Idea Assigned - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`New Assignees`**\n{0}", idea.getAssignedModerators().stream().map(User::getUsername).collect(Collectors.joining(", "))))
                .setUrl(idea.toViewLink())
                .setFooter("Assigned by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_UNASSIGN:
        embedBuilder
                .setTitle("Idea Unassigned - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`New Assignees`**\n{0}", idea.getAssignedModerators().stream().map(User::getUsername).collect(Collectors.joining(", "))))
                .setUrl(idea.toViewLink())
                .setFooter("Unassigned by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_COMMENTS_ENABLE:
        embedBuilder
                .setTitle("Idea Commenting Allowed - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Changed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_COMMENTS_DISABLE:
        embedBuilder
                .setTitle("Idea Commenting Restricted - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Changed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_PIN:
        embedBuilder
                .setTitle("Idea Pinned - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Pinned by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_UNPIN:
        embedBuilder
                .setTitle("Idea Unpinned - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Unpinned by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_VOTES_RESET:
        embedBuilder
                .setTitle("Idea Voters Reset - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Reset by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_UPVOTE:
        embedBuilder
                .setTitle("Idea Upvoted - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Upvoted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_UNDO_UPVOTE:
        embedBuilder
                .setTitle("Idea Upvote Undo - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Undone by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_ATTACHMENT_UPDATE:
        embedBuilder
                .setTitle("Idea Attachment Update - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Updated by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_SUBSCRIBE:
        embedBuilder
                .setTitle("Idea Subscribed - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Subscribed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case IDEA_UNSUBSCRIBE:
        embedBuilder
                .setTitle("Idea Unsubscribed - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Unsubscribed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case COMMENT_CREATE:
        embedBuilder
                .setTitle("Comment Posted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Comment`**\n{0}", comment.getDescription()))
                .setUrl(idea.toViewLink())
                .setFooter("Posted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case COMMENT_DELETE:
        embedBuilder
                .setTitle("Comment Deleted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Comment`**\n{0}", comment.getDescription()))
                .setUrl(idea.toViewLink())
                .setFooter("Deleted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case COMMENT_EDIT:
        embedBuilder
                .setTitle("Comment Edited - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Comment`**\n{0}", comment.getDescription()))
                .setUrl(idea.toViewLink())
                .setFooter("Edited by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case COMMENT_REACT:
        embedBuilder
                .setTitle("Comment Reacted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Comment`**\n{0}\n**`Reaction`**\n{1}", comment.getDescription(), commentReaction.getReactionId()))
                .setUrl(idea.toViewLink())
                .setFooter("Reacted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case COMMENT_UNREACT:
        embedBuilder
                .setTitle("Comment Unreacted - `" + idea.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Comment`**\n{0}\n**`Reaction`**\n{1}", comment.getDescription(), commentReaction.getReactionId()))
                .setUrl(idea.toViewLink())
                .setFooter("Unreacted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case CHANGELOG_CREATE:
        embedBuilder
                .setTitle("New Changelog Posted - `" + changelog.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", changelog.getTitle(), changelog.getDescription()))
                .setUrl(changelog.toViewLink())
                .setFooter("Posted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case CHANGELOG_DELETE:
        embedBuilder
                .setTitle("Changelog Deleted - `" + changelog.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", changelog.getTitle(), changelog.getDescription()))
                .setUrl(changelog.toViewLink())
                .setFooter("Deleted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case CHANGELOG_EDIT:
        embedBuilder
                .setTitle("Changelog Edited - `" + changelog.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Title`**\n{0}\n**`Description`**\n{1}", changelog.getTitle(), changelog.getDescription()))
                .setUrl(changelog.toViewLink())
                .setFooter("Edited by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case CHANGELOG_REACT:
        embedBuilder
                .setTitle("Changelog Reacted - `" + changelog.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Reaction`**\n{0}",
                        changelogReaction.getReactionId()))
                .setUrl(changelog.toViewLink())
                .setFooter("Reacted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case CHANGELOG_UNREACT:
        embedBuilder
                .setTitle("Changelog Unreacted - `" + changelog.getTitle() + "`")
                .setDescription(MessageFormat.format("**`Reaction`**\n{0}",
                        changelogReaction.getReactionId()))
                .setUrl(changelog.toViewLink())
                .setFooter("Unreacted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_SETTINGS_EDIT:
        embedBuilder
                .setTitle("Board Settings Edited - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`Content`**\n{0}",
                        "Data unsupported."))
                .setUrl(board.toViewLink())
                .setFooter("Edited by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_MODERATOR_ADDED:
        embedBuilder
                .setTitle("New Moderator Added - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`Moderator`**\n{0}",
                        moderator.getUser().getUsername()))
                .setUrl(board.toViewLink())
                .setFooter("Added by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_MODERATOR_REMOVED:
        embedBuilder
                .setTitle("Moderator Removed - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`Moderator`**\n{0}",
                        moderator.getUser().getUsername()))
                .setUrl(board.toViewLink())
                .setFooter("Removed by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_MODERATOR_PROMOTED:
        embedBuilder
                .setTitle("Moderator Promoted - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`Moderator`**\n{0}\n**`Previous Role`**\n{1}",
                        moderator.getUser().getUsername(), moderator.getRole().name()))
                .setUrl(board.toViewLink())
                .setFooter("Promoted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_MODERATOR_DEMOTED:
        embedBuilder
                .setTitle("Moderator Demoted - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`Moderator`**\n{0}\n**`Previous Role`**\n{1}",
                        moderator.getUser().getUsername(), moderator.getRole().name()))
                .setUrl(board.toViewLink())
                .setFooter("Demoted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_DELETE:
        embedBuilder
                .setTitle("Board Deleted - `" + board.getName() + "`")
                .setUrl(MailService.HOST_ADDRESS)
                .setFooter("Deleted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_USER_SUSPENSION:
        embedBuilder
                .setTitle("User Suspended - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`User`**\n{0}",
                        suspendedUser.getUser().getUsername()))
                .setUrl(board.toViewLink())
                .setFooter("Suspended by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case BOARD_USER_UNSUSPENSION:
        embedBuilder
                .setTitle("User Unsuspended - `" + board.getName() + "`")
                .setDescription(MessageFormat.format("**`User`**\n{0}",
                        suspendedUser.getUser().getUsername()))
                .setUrl(board.toViewLink())
                .setFooter("Unsuspended by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      case INTEGRATION_GITHUB_IDEA_CONVERT:
        embedBuilder
                .setTitle("Idea Converted to GitHub Issue - `" + idea.getTitle() + "`")
                .setUrl(idea.toViewLink())
                .setFooter("Converted by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
      default:
        embedBuilder
                .setTitle("Invalid request")
                .setDescription("Either invalid or unsupported operation triggered.")
                .setUrl(board.toViewLink())
                .setFooter("Triggered by " + triggerer.getUsername(), triggerer.getAvatar());
        break;
    }
    return embedBuilder;
  }

  @Getter
  public enum WebhookDataObjects {
    USER("user"), IDEA("idea"), BOARD("board"), COMMENT("comment"), COMMENT_REACTION("comment_reaction"),
    CHANGELOG("changelog"), CHANGELOG_REACTION("changelog_reaction"), SUSPENDED_USER("suspended_user"), MODERATOR("moderator");

    private final String name;

    WebhookDataObjects(String name) {
      this.name = name;
    }
  }

}
