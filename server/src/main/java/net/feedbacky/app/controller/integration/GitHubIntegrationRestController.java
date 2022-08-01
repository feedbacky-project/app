package net.feedbacky.app.controller.integration;

import lombok.SneakyThrows;
import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.integration.IntegrationType;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.comment.PatchCommentDto;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.login.LoginProvider;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.IntegrationRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.service.comment.CommentService;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.WebConnectionUtils;
import net.feedbacky.app.util.jwt.GitHubTokenBuilder;
import net.feedbacky.app.util.request.InternalRequestValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.kohsuke.github.GHAppInstallationToken;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@CrossOrigin
@RestController
public class GitHubIntegrationRestController {

  private final UserRepository userRepository;
  private final IdeaRepository ideaRepository;
  private final CommentRepository commentRepository;
  private final BoardRepository boardRepository;
  private final IntegrationRepository integrationRepository;

  @Autowired
  public GitHubIntegrationRestController(UserRepository userRepository, IdeaRepository ideaRepository, CommentRepository commentRepository, BoardRepository boardRepository, IntegrationRepository integrationRepository) {
    this.userRepository = userRepository;
    this.ideaRepository = ideaRepository;
    this.commentRepository = commentRepository;
    this.boardRepository = boardRepository;
    this.integrationRepository = integrationRepository;
  }

  @GetMapping("v1/integration/github")
  public ResponseEntity handleIntegration(@RequestParam(name = "code") String code, @RequestParam(name = "state") String state,
                                          @RequestParam(name = "installation_id") long installationId) throws IOException {
    String content = "client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&redirect_uri={REDIRECT_URI}&code={CODE}&grant_type=authorization_code";
    content = StringUtils.replace(content, "{CLIENT_ID}", System.getenv("INTEGRATION_GITHUB_CLIENT_ID"));
    content = StringUtils.replace(content, "{CLIENT_SECRET}", System.getenv("INTEGRATION_GITHUB_CLIENT_SECRET"));
    content = StringUtils.replace(content, "{REDIRECT_URI}", URLEncoder.encode(System.getenv("INTEGRATION_GITHUB_REDIRECT_URI"), "UTF-8"));
    content = StringUtils.replace(content, "{CODE}", code);
    String accessToken = WebConnectionUtils.getAccessToken("https://github.com/login/oauth/access_token", content);

    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(state, EntityGraphs.named("Board.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException((MessageFormat.format("Board {0} not found.", state))));
    if(!board.getCreator().equals(user)) {
      throw new InsufficientPermissionsException(MessageFormat.format("You do not own board {0}", state));
    }
    if(integrationRepository.findByBoard(board).stream().anyMatch(i -> i.getType() == IntegrationType.GITHUB)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Integration with GitHub is already enabled.");
    }

    GitHub gitHub = new GitHubBuilder().withJwtToken(GitHubTokenBuilder.generateTemporalJwtToken().getToken()).build();
    GHAppInstallationToken appToken = gitHub.getApp().getInstallationById(installationId).createToken().create();
    Integration integration = new Integration();
    integration.setBoard(board);
    integration.setType(IntegrationType.GITHUB);
    integration.setApiKey(accessToken);
    JsonObject jsonObject = new JsonObject();
    jsonObject.addProperty("enabled", false);
    jsonObject.addProperty("installation_id", String.valueOf(installationId));
    JsonArray array = new JsonArray();
    for(String fullName : getRepositoriesForToken(appToken.getToken())) {
      array.add(fullName);
    }
    jsonObject.add("applicable_repositories", array);
    integration.setData(jsonObject.toString());
    integrationRepository.save(integration);
    return ResponseEntity.ok().build();
  }

  @SneakyThrows
  private List<String> getRepositoriesForToken(String token) {
    URL url = new URL("https://api.github.com/installation/repositories");
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
    conn.setRequestProperty("User-Agent", LoginProvider.USER_AGENT);
    conn.setRequestProperty("Content-Type", "application/json");
    conn.setRequestProperty("Authorization", "Bearer " + token);
    conn.setDoOutput(true);

    Map<String, Object> responseData = new ObjectMapper().readValue(WebConnectionUtils.getResponse(conn.getInputStream()), Map.class);
    conn.disconnect();
    List<String> repositories = new ArrayList<>();
    for(Map<String, Object> data : (List<Map<String, Object>>) responseData.get("repositories")) {
      repositories.add((String) data.get("full_name"));
    }
    return repositories;
  }

  @PostMapping("v1/integration/github/dataCallback")
  public ResponseEntity handleWebhookData(@RequestBody String body, @RequestHeader(name = "X-GitHub-Event") String eventType) {
    //ignored
    if(!eventType.equals("issues") && !eventType.equals("issue_comment")) {
      return ResponseEntity.ok().build();
    }

    ObjectMapper mapper = new ObjectMapper();
    TypeReference<Map<String, Object>> ref = new TypeReference<Map<String, Object>>() {};
    try {
      Map<String, Object> data = mapper.readValue(body, ref);
      String action = (String) data.get("action");

      Map<String, Object> senderData = (Map<String, Object>) data.get("sender");
      long githubId = Long.parseLong(String.valueOf(senderData.get("id")));
      String username = String.valueOf(senderData.get("login"));
      String avatar = String.valueOf(senderData.get("avatar_url"));

      Map<String, Object> issueData = (Map<String, Object>) data.get("issue");
      long issueId = Long.parseLong(String.valueOf(issueData.get("id")));
      Idea idea = ideaRepository.findByMetadataContaining("\"" + Idea.IdeaMetadata.INTEGRATION_GITHUB_ISSUE_ID.getKey() + "\":\"" + issueId + "\"")
              .orElseThrow(() -> new ResourceNotFoundException("No linked idea matches the criteria."));
      User user = userRepository.findByIntegrationAccount("github", String.valueOf(githubId))
              .orElse(getOrCreateUser(username, avatar, githubId, idea.getBoard()));

      Comment comment = null;
      CommentBuilder builder = new CommentBuilder().of(idea).by(user);
      if(eventType.equals("issue_comment")) {
        Map<String, Object> commentData = (Map<String, Object>) data.get("comment");
        //if not null then comment was passed from feedbacky, do not create reply loop
        if(commentData.get("performed_via_github_app") != null) {
          return ResponseEntity.ok().build();
        }
        //handle comment edits and deletions here
        if(action.equals("edited") || action.equals("deleted")) {
          long commentId = Long.parseLong(String.valueOf(commentData.get("id")));
          Comment foundComment = commentRepository.findByMetadataContaining("\"" + Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey() + "\":\"" + commentId + "\"")
                  .orElseThrow(() -> new ResourceNotFoundException("No linked comment matches the criteria."));

          //we only accept comments from the same idea
          if(!foundComment.getIdea().equals(idea)) {
            return ResponseEntity.ok().build();
          }
          //we reuse existing code, it will handle every sanitization and safety checks and won't apply changes if needed
          if(action.equals("edited")) {
            foundComment.setDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(String.valueOf(commentData.get("body")))));
            //edit no matter the time
            foundComment.setEdited(true);
            commentRepository.save(foundComment);
          } else {
            foundComment.setViewType(Comment.ViewType.DELETED);
            foundComment.setCreator(null);
            foundComment.setDescription("");
            commentRepository.save(foundComment);
            //to force trend score update
            idea.setComments(idea.getComments());
            ideaRepository.save(idea);
          }
          return ResponseEntity.ok().build();
        }
        //code below handles only new comments
        if(!action.equals("created")) {
          return ResponseEntity.ok().build();
        }
        String commentBody = String.valueOf(commentData.get("body"));
        comment = new Comment();
        comment.setDescription(commentBody);
        comment.setIdea(idea);
        comment.setCreator(user);
        comment.setSpecialType(Comment.SpecialType.LEGACY);
        comment.setViewType(Comment.ViewType.PUBLIC);
        JsonObject json = new JsonObject();
        json.addProperty(Comment.CommentMetadata.INTEGRATION_GITHUB_COMMENT_ID.getKey(), String.valueOf(commentData.get("id")));
        json.addProperty(Comment.CommentMetadata.POSTED_VIA.getKey(), "GitHub");
        comment.setMetadata(json.toString());
      } else {
        Map<String, Object> assigneeData = (Map<String, Object>) data.getOrDefault("assignee", new HashMap<>());
        switch(action) {
          case "reopened":
          case "opened":
            builder = builder.type(Comment.SpecialType.IDEA_OPENED).placeholders(user.convertToSpecialCommentMention());
            idea.setStatus(Idea.IdeaStatus.OPENED);
            break;
          case "closed":
            builder = builder.type(Comment.SpecialType.IDEA_CLOSED).placeholders(user.convertToSpecialCommentMention());
            idea.setStatus(Idea.IdeaStatus.CLOSED);
            break;
          case "locked":
            builder = builder.type(Comment.SpecialType.COMMENTS_RESTRICTED).placeholders(user.convertToSpecialCommentMention());
            idea.setCommentingRestricted(true);
            break;
          case "unlocked":
            builder = builder.type(Comment.SpecialType.COMMENTS_ALLOWED).placeholders(user.convertToSpecialCommentMention());
            idea.setCommentingRestricted(false);
            break;
          case "pinned":
            builder = builder.type(Comment.SpecialType.IDEA_PINNED).placeholders(user.convertToSpecialCommentMention());
            idea.setPinned(true);
            break;
          case "unpinned":
            builder = builder.type(Comment.SpecialType.IDEA_UNPINNED).placeholders(user.convertToSpecialCommentMention());
            idea.setPinned(false);
            break;
          case "unassigned":
          case "assigned":
            String assigneeId = String.valueOf(assigneeData.get("id"));
            Optional<User> assignedOptional = userRepository.findByIntegrationAccount("github", assigneeId);
            //do not assign/unassign non existing account and do not attempt to make one
            if(!assignedOptional.isPresent()) {
              return ResponseEntity.ok().build();
            }
            Set<User> assignees = idea.getAssignedModerators();
            User assignee = assignedOptional.get();
            if(action.equals("assigned")) {
              assignees.add(assignee);
              builder = builder.type(Comment.SpecialType.IDEA_ASSIGNED).placeholders(assignee.convertToSpecialCommentMention(), user.convertToSpecialCommentMention());
            } else {
              assignees.remove(assignee);
              builder = builder.type(Comment.SpecialType.IDEA_UNASSIGNED).placeholders(user.convertToSpecialCommentMention(), assignee.convertToSpecialCommentMention());
            }
            idea.setAssignedModerators(assignees);
            break;
          default:
            throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Unsupported event.");
        }
      }
      if(comment == null) {
        comment = builder.metadata(Comment.CommentMetadata.POSTED_VIA, "GitHub").build();
      }
      commentRepository.save(comment);
      ideaRepository.save(idea);
      return ResponseEntity.ok().build();
    } catch(JsonProcessingException e) {
      e.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Data read failure.");
    }
  }

  private User getOrCreateUser(String username, String avatar, long id, Board board) {
    Optional<User> optional = userRepository.findByToken(board.getId() + "-GHI-" + id);
    if(optional.isPresent()) {
      return optional.get();
    }
    User user = new User();
    user.setUsername(username);
    user.setAvatar(avatar);
    user.setFake(true);
    user.setToken(board.getId() + "-GHI-" + id);
    MailPreferences preferences = new MailPreferences();
    preferences.setNotificationsEnabled(false);
    preferences.setUser(user);
    user.setMailPreferences(preferences);
    user.setConnectedAccounts(new HashSet<>());
    return userRepository.save(user);
  }

}
