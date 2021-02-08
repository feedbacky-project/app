package net.feedbacky.app.service.board.webhook;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.webhook.FetchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PatchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PostWebhookDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.WebhookRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.RequestValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Service
public class WebhookServiceImpl implements WebhookService {

  private final BoardRepository boardRepository;
  private final WebhookRepository webhookRepository;
  private final UserRepository userRepository;

  @Autowired
  public WebhookServiceImpl(BoardRepository boardRepository, WebhookRepository webhookRepository, UserRepository userRepository) {
    this.boardRepository = boardRepository;
    this.webhookRepository = webhookRepository;
    this.userRepository = userRepository;
  }

  @Override
  public List<FetchWebhookDto> getAll(String discriminator) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to view webhooks of this board.");
    }
    return webhookRepository.findByBoard(board).stream().map(webhook -> new FetchWebhookDto().from(webhook)).collect(Collectors.toList());
  }

  @Override
  public ResponseEntity<FetchWebhookDto> post(String discriminator, PostWebhookDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found."));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to post webhooks to this board.");
    }
    if(board.getWebhooks().size() >= 5) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Cannot create more than 5 webhooks.");
    }
    if(webhookRepository.findByUrl(dto.getUrl()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Webhook with that url in that board already exists.");
    }
    Webhook webhook = dto.convertToEntity(board);
    webhookRepository.save(webhook);
    board.getWebhooks().add(webhook);
    boardRepository.save(board);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user);
    board.getWebhookExecutor().executeWebhooks(Webhook.Event.SAMPLE_EVENT, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(new FetchWebhookDto().from(webhook));
  }

  @Override
  public FetchWebhookDto patch(long id, PatchWebhookDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook with id " + id + " does not exist."));
    Board board = webhook.getBoard();
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to patch webhooks to this board.");
    }
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, webhook);
    return new FetchWebhookDto().from(webhook);
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Webhook with id " + id + " does not exist."));
    if(!hasPermission(webhook.getBoard(), Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to delete webhook of this board.");
    }
    Board board = webhook.getBoard();
    if(!board.getWebhooks().contains(webhook)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Webhook with id " + id + " does not belong to this board.");
    }
    board.getWebhooks().remove(webhook);
    boardRepository.save(board);
    webhookRepository.delete(webhook);
    return ResponseEntity.noContent().build();
  }
}
