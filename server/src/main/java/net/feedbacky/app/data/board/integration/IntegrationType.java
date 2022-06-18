package net.feedbacky.app.data.board.integration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.user.ConnectedAccount;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.util.integration.GitHubUtils;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.kohsuke.github.GHIssue;
import org.kohsuke.github.GHIssueComment;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GHUser;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Getter
public enum IntegrationType {
  GITHUB(Arrays.asList("INTEGRATION_GITHUB_CLIENT_ID", "INTEGRATION_GITHUB_CLIENT_SECRET",
          "INTEGRATION_GITHUB_REDIRECT_URI", "INTEGRATION_GITHUB_PRIVATE_KEY"), new IntegrationAction(ActionTrigger.Trigger.COMMENT_CREATE, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Comment comment = (Comment) trigger.getRelatedObjects().get(0);
    //moderative, non public comments and fake accounts are ignored within this trigger
    if(comment.isSpecial() || comment.getViewType() != Comment.ViewType.PUBLIC || comment.getCreator().isFake()) {
      return;
    }
    getIssueFromIdeaAndExecute(integration, comment.getIdea(), i -> {
      try {
        String authorName = comment.getCreator().getUsername();
        if(comment.getReplyTo() == null) {
          i.comment(MessageFormat.format("<div type 'discussions-op-text'>\n\n<sup>**{0}** said</sup>\n{1}\n</div>",
                  authorName, comment.getDescription()));
        } else {
          String replyTo = comment.getReplyTo().getCreator().getUsername();
          i.comment(MessageFormat.format("<div type 'discussions-op-text'>\n\n<sup>**{0}** replied to **{1}**</sup>\n{2}\n</div>",
                  authorName, replyTo, comment.getDescription()));
        }
      } catch(IOException ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to comment linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_COMMENTS_DISABLE, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        i.lock();
      } catch(IOException ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to unlock linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_COMMENTS_ENABLE, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        i.unlock();
      } catch(IOException ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to unlock linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_CLOSE, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        i.close();
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to close linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_OPEN, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        i.reopen();
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to open linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_ASSIGN, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        List<GHUser> users = i.getRepository().listAssignees().toList();
        for(GHUser user : users) {
          boolean isLinked = false;
          for(ConnectedAccount account : trigger.getTriggerer().getConnectedAccounts()){
            if(account.getProvider().equals("github") && account.getAccountId().equals(String.valueOf(user.getId()))) {
              isLinked = true;
              break;
            }
          }
          if(trigger.getTriggerer().getEmail().equals(user.getEmail()) || isLinked) {
            i.assignTo(user);
            break;
          }
        }
        i.reopen();
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to change assignee of linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.IDEA_UNASSIGN, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Idea idea = (Idea) trigger.getRelatedObjects().get(0);
    getIssueFromIdeaAndExecute(integration, idea, i -> {
      try {
        List<GHUser> users = i.getRepository().listAssignees().toList();
        for(GHUser user : users) {
          boolean isLinked = false;
          for(ConnectedAccount account : trigger.getTriggerer().getConnectedAccounts()){
            if(account.getProvider().equals("github") && account.getAccountId().equals(String.valueOf(user.getId()))) {
              isLinked = true;
              break;
            }
          }
          if(trigger.getTriggerer().getEmail().equals(user.getEmail()) || isLinked) {
            i.removeAssignees(user);
            break;
          }
        }
        i.reopen();
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to change assignee of linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.COMMENT_EDIT, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Comment comment = (Comment) trigger.getRelatedObjects().get(0);
    //moderative, non public comments and fake accounts are ignored within this trigger
    if(comment.isSpecial() || comment.getViewType() != Comment.ViewType.PUBLIC || comment.getCreator().isFake()) {
      return;
    }
    JsonObject json = new Gson().fromJson(comment.getMetadata(), JsonObject.class);
    if(!json.has(Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey())) {
      return;
    }
    long commentId = Long.parseLong(json.get(Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey()).getAsString());
    getIssueFromIdeaAndExecute(integration, comment.getIdea(), i -> {
      try {
        List<GHIssueComment> comments = i.getComments();
        for(GHIssueComment ghComment : comments) {
          if(ghComment.getId() != commentId) {
           continue;
          }
          String authorName = comment.getCreator().getUsername();
          String updateMessage;
          if(comment.getReplyTo() == null) {
            updateMessage = MessageFormat.format("<div type 'discussions-op-text'>\n\n<sup>**{0}** said</sup>\n{1}\n</div>",
                    authorName, comment.getDescription());
          } else {
            String replyTo = comment.getReplyTo().getCreator().getUsername();
            updateMessage = MessageFormat.format("<div type 'discussions-op-text'>\n\n<sup>**{0}** replied to **{1}**</sup>\n{2}\n</div>",
                    authorName, replyTo, comment.getDescription());
          }
          ghComment.update(updateMessage);
          break;
        }
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to edit comment of linked GitHub issue.");
      }
    });
  }), new IntegrationAction(ActionTrigger.Trigger.COMMENT_DELETE, (trigger, integration) -> {
    if(!isEnabled(integration)) {
      return;
    }
    Comment comment = (Comment) trigger.getRelatedObjects().get(0);
    //moderative, non public comments and fake accounts are ignored within this trigger
    if(comment.isSpecial() || comment.getViewType() != Comment.ViewType.PUBLIC || comment.getCreator().isFake()) {
      return;
    }
    JsonObject json = new Gson().fromJson(comment.getMetadata(), JsonObject.class);
    if(!json.has(Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey())) {
      return;
    }
    long commentId = Long.parseLong(json.get(Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey()).getAsString());
    getIssueFromIdeaAndExecute(integration, comment.getIdea(), i -> {
      try {
        List<GHIssueComment> comments = i.getComments();
        for(GHIssueComment ghComment : comments) {
          if(ghComment.getId() != commentId) {
            continue;
          }
          ghComment.delete();
          break;
        }
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to edit comment of linked GitHub issue.");
      }
    });
  }));

  private final List<String> environmentVariables;
  private final IntegrationAction[] integrationActions;

  IntegrationType(List<String> environmentVariables, IntegrationAction... integrationActions) {
    this.environmentVariables = environmentVariables;
    this.integrationActions = integrationActions;
  }

  public boolean isEnabled() {
    for(String envVar : environmentVariables) {
      if(System.getenv(envVar) == null) {
        return false;
      }
    }
    return true;
  }

  private static boolean isEnabled(Integration integration) {
    if(integration.getData().equals("")) {
      return false;
    }
    Gson gson = new Gson();
    JsonObject integrationMetadata = gson.fromJson(integration.getData(), JsonObject.class);
    if(!integrationMetadata.has("enabled") || !integrationMetadata.has("advancedTriggers")) {
      return false;
    }
    return integrationMetadata.get("enabled").getAsBoolean() && integrationMetadata.get("advancedTriggers").getAsBoolean();
  }

  private static void getIssueFromIdeaAndExecute(Integration integration, Idea idea, Consumer<GHIssue> consumer) {
    JsonObject ideaMetadata = new Gson().fromJson(idea.getMetadata(), JsonObject.class);
    //no metadata for requested trigger
    if(ideaMetadata.entrySet().isEmpty() || !ideaMetadata.has(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_NUMBER.getKey())) {
      return;
    }
    try {
      GHRepository repository = GitHubUtils.getRepoFromIntegration(integration);
      int issueId = Integer.parseInt(ideaMetadata.get(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_NUMBER.getKey()).getAsString());
      GHIssue issue = repository.getIssue(issueId);
      consumer.accept(issue);
    } catch(IOException ex) {
      ex.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "GitHub integration failure, contact administrator.");
    }
  }

  @Data
  @AllArgsConstructor
  public static class IntegrationAction {

    private ActionTrigger.Trigger trigger;
    private BiConsumer<ActionTrigger, Integration> consumer;

  }
}