package net.feedbacky.app.data.trigger;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.user.User;

import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@AllArgsConstructor
@Getter
public class ActionTrigger {

  private Trigger trigger;
  private Board triggeredBoard;
  private User triggerer;

  private List<Object> relatedObjects;

  public enum Trigger {
    //Idea related triggers
    IDEA_CREATE(Idea.class), IDEA_DELETE(Idea.class), IDEA_EDIT(Idea.class), IDEA_CLOSE(Idea.class), IDEA_OPEN(Idea.class),
    IDEA_TAGS_CHANGE(Idea.class), IDEA_ASSIGN(Idea.class), IDEA_UNASSIGN(Idea.class), IDEA_COMMENTS_ENABLE(Idea.class),
    IDEA_COMMENTS_DISABLE(Idea.class), IDEA_PIN(Idea.class), IDEA_UNPIN(Idea.class), IDEA_VOTES_RESET(Idea.class),
    IDEA_UPVOTE(Idea.class), IDEA_UNDO_UPVOTE(Idea.class), IDEA_ATTACHMENT_UPDATE(Idea.class),
    IDEA_SUBSCRIBE(Idea.class), IDEA_UNSUBSCRIBE(Idea.class),

    //Comment related triggers
    COMMENT_CREATE(Comment.class), COMMENT_DELETE(Comment.class), COMMENT_EDIT(Comment.class),
    COMMENT_REACT(Comment.class, CommentReaction.class), COMMENT_UNREACT(Comment.class, CommentReaction.class),

    //Changelog related triggers
    CHANGELOG_CREATE(Changelog.class), CHANGELOG_DELETE(Changelog.class), CHANGELOG_EDIT(Changelog.class),
    CHANGELOG_REACT(Changelog.class, ChangelogReaction.class), CHANGELOG_UNREACT(Changelog.class, ChangelogReaction.class),

    //Board related triggers
    BOARD_SETTINGS_EDIT(Board.class), BOARD_MODERATOR_ADDED(Board.class, Moderator.class), BOARD_MODERATOR_REMOVED(Board.class, Moderator.class),
    BOARD_MODERATOR_PROMOTED(Board.class, Moderator.class), BOARD_MODERATOR_DEMOTED(Board.class, Moderator.class), BOARD_DELETE(Board.class),
    BOARD_USER_SUSPENSION(Board.class, SuspendedUser.class), BOARD_USER_UNSUSPENSION(Board.class, SuspendedUser.class),

    //Integration related triggers
    INTEGRATION_GITHUB_IDEA_CONVERT(Idea.class);

    @Getter private final Class[] triggerClasses;

    Trigger(Class... triggerClasses) {
      this.triggerClasses = triggerClasses;
    }

    public boolean containsObject(Object obj) {
      for(Class clazz : triggerClasses) {
        if(clazz.isInstance(obj)) {
          return true;
        }
      }
      return false;
    }

    public static Map<String, List<Trigger>> getAllTriggerEvents() {
      Map<String, List<Trigger>> events = new HashMap<>();
      for(Trigger trigger : Trigger.values()) {
        for(Class clazz : trigger.getTriggerClasses()) {
          String key = StringUtils.uncapitalize(clazz.getSimpleName());
          List<Trigger> triggers = events.getOrDefault(key, new ArrayList<>());
          triggers.add(trigger);
          events.put(key, triggers);
        }
      }
      return events;
    }
  }

}
