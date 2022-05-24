package net.feedbacky.app.service.idea.integration;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.integration.IntegrationType;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.integration.GitHubUtils;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import org.kohsuke.github.GHIssue;
import org.kohsuke.github.GHIssueBuilder;
import org.kohsuke.github.GHLabel;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GHUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Service
public class IdeaIntegrationServiceImpl implements IdeaIntegrationService {

  private final UserRepository userRepository;
  private final IdeaRepository ideaRepository;
  private final CommentRepository commentRepository;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  public IdeaIntegrationServiceImpl(UserRepository userRepository, IdeaRepository ideaRepository, CommentRepository commentRepository, TriggerExecutor triggerExecutor) {
    this.userRepository = userRepository;
    this.ideaRepository = ideaRepository;
    this.commentRepository = commentRepository;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public ResponseEntity postGitHubIdeaToIssue(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    ServiceValidator.isPermitted(idea.getBoard(), Moderator.Role.MODERATOR, user);
    Integration integration = idea.getBoard().getIntegrations().stream().filter(i -> i.getType() == IntegrationType.GITHUB).findFirst()
            .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub integration not yet enabled."));
    try {
      GHRepository repository = GitHubUtils.getRepoFromIntegration(integration);
      GHIssueBuilder builder = repository.createIssue(idea.getTitle()).body(generateGitHubIdeaDescription(idea));
      ideaToGitHubIssue(repository, new Gson().fromJson(integration.getData(), JsonObject.class), idea, user, builder.create());
    } catch(IOException e) {
      e.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Integration issue detected, error reported to administrator.");
    }
    return ResponseEntity.ok().build();
  }

  private String generateGitHubIdeaDescription(Idea idea) {
    SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
    String truncatedDescription = idea.getDescription().substring(0, Math.min(1000, idea.getDescription().length()));
    if(truncatedDescription.length() != idea.getDescription().length()) {
      truncatedDescription += "...";
    }
    return "### Discussed at [" + idea.getBoard().getDiscriminator() + "#" + idea.getId() + "](" + idea.toViewLink() + ")\n"
            + "<div type 'discussions-op-text'>\n\n"
            + "<sup>Originally posted by **" + idea.getCreator().getUsername() + "** at " + sdf.format(idea.getCreationDate()) + "</sup>\n"
            + truncatedDescription + "\n"
            + "</div>";
  }

  @Override
  public FetchIdeaDto patchGitHubLinkIdeaToIssue(long id, long issueId) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    ServiceValidator.isPermitted(idea.getBoard(), Moderator.Role.MODERATOR, user);
    Integration integration = idea.getBoard().getIntegrations().stream().filter(i -> i.getType() == IntegrationType.GITHUB).findFirst()
            .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub integration not yet enabled."));
    try {
      GHRepository repository = GitHubUtils.getRepoFromIntegration(integration);
      //todo check if exists
      GHIssue issue = repository.getIssue((int) issueId);
      ideaToGitHubIssue(repository, new Gson().fromJson(integration.getData(), JsonObject.class), idea, user, issue);
      issue.comment(generateGitHubIdeaDescription(idea));
    } catch(IOException e) {
      e.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Integration issue detected, error reported to administrator.");
    }
    return new FetchIdeaDto().from(idea).withUser(idea, user);
  }

  private void ideaToGitHubIssue(GHRepository repository, JsonObject json, Idea idea, User user, GHIssue issue) throws IOException {
    JsonElement linkedIssue = json.get(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_NUMBER.getKey());
    if(json.has(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_NUMBER.getKey()) && issue.getId() == Integer.parseInt(linkedIssue.getAsString())) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Issue is already linked with this idea.");
    }
    if(json.get("tagsToLabels").getAsBoolean()) {
      List<GHLabel> labels = repository.listLabels().toList();
      for(Tag tag : idea.getTags()) {
        if(labels.stream().anyMatch(l -> l.getName().equals(tag.getName()))) {
          continue;
        }
        repository.createLabel(tag.getName(), tag.getColor().replace("#", ""));
      }
      List<String> labelsToAdd = new ArrayList<>();
      for(Tag tag : idea.getTags()) {
        labelsToAdd.add(tag.getName());
      }
      issue.addLabels(labelsToAdd.toArray(new String[0]));
    }
    List<GHUser> assignees = repository.listAssignees().toList();
    List<GHUser> toAssign = new ArrayList<>();
    for(User assignee : idea.getAssignedModerators()) {
      for(GHUser ghUser : assignees) {
        if(assignee.getUsername().equalsIgnoreCase(ghUser.getName()) || assignee.getEmail().equals(ghUser.getEmail())) {
          toAssign.add(ghUser);
        }
      }
    }
    issue.addAssignees(toAssign);
    CommentBuilder commentBuilder = new CommentBuilder().of(idea).by(user);
    Comment comment = commentBuilder.type(Comment.SpecialType.INTEGRATION_GITHUB_CONVERT)
            .placeholders(user.convertToSpecialCommentMention(), convertToLinkedText("GitHub Issue.", issue.getHtmlUrl().toString())).build();

    Set<Comment> comments = idea.getComments();
    comments.add(comment);
    idea.setComments(comments);
    commentRepository.save(comment);
    JsonObject metadata = new Gson().fromJson(idea.getMetadata(), JsonObject.class);
    metadata.addProperty(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_ID.getKey(), String.valueOf(issue.getId()));
    metadata.addProperty(Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_NUMBER.getKey(), String.valueOf(issue.getNumber()));
    metadata.addProperty(Idea.IdeaMetadata.INTEGRATION_GITHUB_URL.getKey(), issue.getHtmlUrl().toString());
    idea.setMetadata(metadata.toString());
    ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.INTEGRATION_GITHUB_IDEA_CONVERT)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
  }

  private String convertToLinkedText(String text, String link) {
    return "{data_linked_text;" + text + ";" + link + "}";
  }

}
