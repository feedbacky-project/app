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
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
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
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphUtils.fromAttributePaths("permissions"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    return webhookRepository.findByBoard(board).stream().map(webhook -> new FetchWebhookDto().from(webhook)).collect(Collectors.toList());
  }

  @Override
  public ResponseEntity<FetchWebhookDto> post(String discriminator, PostWebhookDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    if(webhookRepository.findByUrl(dto.getUrl()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Webhook with that URL already exists.");
    }
    Webhook webhook = dto.convertToEntity(board);
    webhookRepository.save(webhook);
    board.getWebhooks().add(webhook);
    boardRepository.save(board);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user);
    board.getWebhookExecutor().executeWebhook(webhook, Webhook.Event.SAMPLE_EVENT, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(new FetchWebhookDto().from(webhook));
  }

  @Override
  public FetchWebhookDto patch(long id, PatchWebhookDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Webhook with id {0} not found.", id)));
    Board board = webhook.getBoard();
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, webhook);
    return new FetchWebhookDto().from(webhook);
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Webhook with id {0} not found.", id)));
    ServiceValidator.isPermitted(webhook.getBoard(), Moderator.Role.ADMINISTRATOR, user);
    Board board = webhook.getBoard();
    if(!board.getWebhooks().contains(webhook)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Webhook with id {0} not found.", id));
    }
    board.getWebhooks().remove(webhook);
    boardRepository.save(board);
    webhookRepository.delete(webhook);
    return ResponseEntity.noContent().build();
  }
}
