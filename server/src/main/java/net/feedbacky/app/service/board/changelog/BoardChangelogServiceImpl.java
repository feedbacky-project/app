package net.feedbacky.app.service.board.changelog;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PostChangelogDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.ChangelogRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Service
public class BoardChangelogServiceImpl implements BoardChangelogService {

  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final ChangelogRepository changelogRepository;

  @Autowired
  public BoardChangelogServiceImpl(BoardRepository boardRepository, UserRepository userRepository, ChangelogRepository changelogRepository) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.changelogRepository = changelogRepository;
  }

  @Override
  public PaginableRequest<List<FetchChangelogDto>> getAll(String discriminator, int page, int pageSize) {
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphs.empty())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    Page<Changelog> pageData = changelogRepository.findByBoard(board, PageRequest.of(page, pageSize));
    List<Changelog> changelogs = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), changelogs.stream()
            .map(changelog -> new FetchChangelogDto().from(changelog)).collect(Collectors.toList()));
  }

  @Override
  public ResponseEntity<FetchChangelogDto> post(String discriminator, PostChangelogDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.MODERATOR, user);
    Changelog changelog = dto.convertToEntity(board);
    board.getChangelogs().add(changelog);
    changelogRepository.save(changelog);

    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withChangelog(changelog);
    board.getWebhookExecutor().executeWebhooks(Webhook.Event.CHANGELOG_CREATE, builder.build());

    return ResponseEntity.ok(new FetchChangelogDto().from(changelog));
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Changelog changelog = changelogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Changelog {0} not found.", id)));
    ServiceValidator.isPermitted(changelog.getBoard(), Moderator.Role.MODERATOR, user);
    changelogRepository.delete(changelog);
    return ResponseEntity.noContent().build();
  }
}
