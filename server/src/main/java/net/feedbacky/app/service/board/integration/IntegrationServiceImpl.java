package net.feedbacky.app.service.board.integration;

import io.jsonwebtoken.SignatureAlgorithm;
import lombok.SneakyThrows;
import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.integration.FetchGithubIssue;
import net.feedbacky.app.data.board.dto.integration.FetchIntegrationDto;
import net.feedbacky.app.data.board.dto.integration.PatchIntegrationDto;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.integration.IntegrationType;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.IntegrationRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.jwt.GitHubTokenBuilder;
import net.feedbacky.app.util.jwt.JwtToken;
import net.feedbacky.app.util.jwt.JwtTokenBuilder;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.kohsuke.github.GHIssueState;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Service
public class IntegrationServiceImpl implements IntegrationService {

  private final UserRepository userRepository;
  private final BoardRepository boardRepository;
  private final IntegrationRepository integrationRepository;

  @Autowired
  public IntegrationServiceImpl(BoardRepository boardRepository, UserRepository userRepository, IntegrationRepository integrationRepository) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.integrationRepository = integrationRepository;
  }

  @SneakyThrows
  @Override
  public List<FetchGithubIssue> getListedGitHubIssues(String discriminator) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphs.named("Board.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException((MessageFormat.format("Board {0} not found.", discriminator))));
    ServiceValidator.isPermitted(board, Moderator.Role.MODERATOR, user);
    Integration integration = board.getIntegrations().stream().filter(i -> i.getType() == IntegrationType.GITHUB)
            .findFirst().orElseThrow(() -> new ResourceNotFoundException((MessageFormat.format("GitHub Integration not yet enabled.", discriminator))));
    if(integration.getData().equals("")) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub Integration not yet enabled.");
    }
    JsonObject json = new Gson().fromJson(integration.getData(), JsonObject.class);
    if(!json.get("enabled").getAsBoolean()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub Integration not yet enabled.");
    }
    GitHub gitHub = new GitHubBuilder().withAppInstallationToken(integration.getApiKey()).build();
    validateKey(gitHub);
    GHRepository repository = gitHub.getRepository(json.get("repository").getAsString());
    return repository.getIssues(GHIssueState.OPEN).stream().filter(i -> !i.isPullRequest()).map(i -> new FetchGithubIssue().from(i)).collect(Collectors.toList());
  }

  @Override
  public FetchIntegrationDto patchIntegrationData(long id, PatchIntegrationDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Integration integration = integrationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Integration {0} not found.", id)));
    ServiceValidator.isPermitted(integration.getBoard(), Moderator.Role.OWNER, user);
    try {
      JsonObject json = new Gson().fromJson(dto.getData(), JsonObject.class);
      switch(integration.getType()) {
        case GITHUB:
          if(!json.has("repository") || !json.has("tagsToLabels") || !json.has("advancedTriggers")) {
            throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Missing 'repository' or/and 'tagsToLabels' or/and 'advancedTriggers' values in integration data.");
          }
          GitHub gitHub = new GitHubBuilder().withAppInstallationToken(integration.getApiKey()).build();
          validateKey(gitHub);
          break;
      }
      Map<String, Object> map = new HashMap<>();
      Gson gson = new Gson();
      //merge new and old data and put dto data last to override previous values
      map.putAll(gson.fromJson(integration.getData(), Map.class));
      map.putAll(gson.fromJson(dto.getData(), Map.class));
      map.put("enabled", true);

      integration.setData(gson.toJson(map));
      integrationRepository.save(integration);
      return new FetchIntegrationDto().from(integration).withConfidentialData(integration, true);
    } catch(Exception ex) {
      ex.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid integration data provided.");
    }
  }

  private void validateKey(GitHub gitHub) {
    try {
      gitHub.checkApiUrlValidity();
    } catch(IOException e) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Integration API Key is invalid, please recreate GitHub Integration.");
    }
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Integration integration = integrationRepository.findById(id)
            .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Integration with id {0} not found.", id)));
    ServiceValidator.isPermitted(integration.getBoard(), Moderator.Role.OWNER, user);
    JsonObject json = new Gson().fromJson(integration.getData(), JsonObject.class);
    try {
      switch(integration.getType()) {
        case GITHUB:
          JwtToken jwtToken = new JwtTokenBuilder().withIssuer(System.getenv("INTEGRATION_GITHUB_APP_ID"))
                  .withExpirationDate(new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(6)))
                  .withAlgorithm(SignatureAlgorithm.RS256, GitHubTokenBuilder.getGitHubSigningKey()).build();

          GitHub gitHub = new GitHubBuilder().withJwtToken(jwtToken.getToken()).build();
          gitHub.getApp().getInstallationById(json.get("installation_id").getAsLong()).deleteInstallation();
          break;
      }
    } catch(Exception ex) {
      ex.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Couldn't disable integration, contact administrator.");
    }
    integrationRepository.delete(integration);
    return ResponseEntity.ok().build();
  }

}
