package net.feedbacky.app.service.board.webhook;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.webhook.FetchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PatchWebhookDto;
import net.feedbacky.app.data.board.dto.webhook.PostWebhookDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.board.webhook.WebhookExecutor;
import net.feedbacky.app.data.trigger.ActionTrigger;
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
import java.util.ArrayList;
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
  private final WebhookExecutor webhookExecutor;

  @Autowired
  public WebhookServiceImpl(BoardRepository boardRepository, WebhookRepository webhookRepository, UserRepository userRepository, WebhookExecutor webhookExecutor) {
    this.boardRepository = boardRepository;
    this.webhookRepository = webhookRepository;
    this.userRepository = userRepository;
    this.webhookExecutor = webhookExecutor;
  }

  @Override
  public List<FetchWebhookDto> getAll(String discriminator) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    return webhookRepository.findByBoard(board).stream().map(Webhook::toDto).collect(Collectors.toList());
  }

  @Override
  public ResponseEntity<FetchWebhookDto> post(String discriminator, PostWebhookDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    if(webhookRepository.findByUrl(dto.getUrl()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Webhook with that URL already exists.");
    }
    Webhook webhook = dto.convertToEntity(board);
    webhook = webhookRepository.save(webhook);
    board.getWebhooks().add(webhook);
    boardRepository.save(board);
    return ResponseEntity.status(HttpStatus.CREATED).body(webhook.toDto());
  }

  @Override
  public FetchWebhookDto patch(long id, PatchWebhookDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Webhook webhook = webhookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Webhook with id {0} not found.", id)));
    if(!dto.getUrl().equals(webhook.getUrl()) && webhookRepository.findByUrl(dto.getUrl()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Webhook with that URL already exists.");
    }
    Board board = webhook.getBoard();
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    webhook.setUrl(dto.getUrl());
    List<ActionTrigger.Trigger> triggers = new ArrayList<>();
    for(String event : dto.getTriggers()) {
      try {
        triggers.add(ActionTrigger.Trigger.valueOf(event));
      } catch(Exception ex) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid webhook trigger '" + event + "'.");
      }
    }
    webhook.setTriggers(triggers);
    webhook = webhookRepository.save(webhook);
    return webhook.toDto();
  }

  @Override
  public ResponseEntity delete(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
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
