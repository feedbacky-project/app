package net.feedbacky.app.service.board.changelog;

import net.feedbacky.app.data.emoji.EmojiDataRegistry;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PatchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PostChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.reaction.FetchChangelogReactionDto;
import net.feedbacky.app.data.board.dto.changelog.reaction.PostChangelogReactionDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.ChangelogRepository;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.filter.SortFilterResolver;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Service
public class ChangelogServiceImpl implements ChangelogService {

  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final ChangelogRepository changelogRepository;
  private final TriggerExecutor triggerExecutor;
  private final EmojiDataRegistry emojiDataRegistry;

  @Autowired
  public ChangelogServiceImpl(BoardRepository boardRepository, UserRepository userRepository, ChangelogRepository changelogRepository,
                              TriggerExecutor triggerExecutor, EmojiDataRegistry emojiDataRegistry) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.changelogRepository = changelogRepository;
    this.triggerExecutor = triggerExecutor;
    this.emojiDataRegistry = emojiDataRegistry;
  }

  @Override
  public PaginableRequest<List<FetchChangelogDto>> getAll(String discriminator, int page, int pageSize, SortType sortType) {
    Page<Changelog> pageData = changelogRepository.findByBoardDiscriminator(discriminator, PageRequest.of(page, pageSize, SortFilterResolver.resolveChangelogSorting(sortType)))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));;
    List<Changelog> changelogs = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), changelogs.stream()
            .map(Changelog::toDto).collect(Collectors.toList()));
  }

  @Override
  public PaginableRequest<List<FetchChangelogDto>> getAllChangelogsContaining(String discriminator, int page, int pageSize, String query, SortType sortType) {
    Page<Changelog> pageData = changelogRepository.findByQuery(discriminator, query, PageRequest.of(page, pageSize, SortFilterResolver.resolveChangelogSorting(sortType)))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    List<Changelog> changelogs = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), changelogs.stream()
            .map(Changelog::toDto).collect(Collectors.toList()));
  }

  @Override
  public ResponseEntity<FetchChangelogDto> post(String discriminator, PostChangelogDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.MODERATOR, user);
    Changelog changelog = dto.convertToEntity(board, user);
    board.getChangelogs().add(changelog);
    changelog = changelogRepository.save(changelog);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.CHANGELOG_CREATE)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(changelog)
            .build()
    );
    board.setLastChangelogUpdate(Calendar.getInstance().getTime());
    boardRepository.save(board);

    return ResponseEntity.ok(changelog.toDto());
  }

  @Override
  public FetchChangelogReactionDto postReaction(long id, PostChangelogReactionDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Changelog changelog = changelogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Changelog with id {0} not found.", id)));
    if(emojiDataRegistry.getEmojis().stream().noneMatch(e -> e.getId().equals(dto.getReactionId()))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid reaction.");
    }
    if(changelog.getReactions().stream().anyMatch(r -> r.getUser().equals(user) && r.getReactionId().equals(dto.getReactionId()))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already reacted.");
    }
    ChangelogReaction reaction = new ChangelogReaction();
    reaction.setChangelog(changelog);
    reaction.setReactionId(dto.getReactionId());
    reaction.setUser(user);
    changelog.getReactions().add(reaction);
    changelogRepository.save(changelog);
    reaction = changelog.getReactions().stream().filter(r -> r.getReactionId().equals(dto.getReactionId()) && r.getUser().equals(user)).findFirst().get();

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.CHANGELOG_REACT)
            .withBoard(changelog.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(changelog, reaction)
            .build()
    );
    return reaction.toDto();
  }

  @Override
  public FetchChangelogDto patch(long id, PatchChangelogDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Changelog changelog = changelogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Changelog with id {0} not found.", id)));
    ServiceValidator.isPermitted(changelog.getBoard(), Moderator.Role.MODERATOR, user);
    changelog.setTitle(dto.getTitle());
    changelog.setDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(dto.getDescription())));
    changelog = changelogRepository.save(changelog);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.CHANGELOG_EDIT)
            .withBoard(changelog.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(changelog)
            .build()
    );
    return changelog.toDto();
  }

  @Override
  public ResponseEntity delete(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Changelog changelog = changelogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Changelog {0} not found.", id)));
    ServiceValidator.isPermitted(changelog.getBoard(), Moderator.Role.MODERATOR, user);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.CHANGELOG_DELETE)
            .withBoard(changelog.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(changelog)
            .build()
    );
    changelogRepository.delete(changelog);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deleteReaction(long id, String reactionId) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Changelog changelog = changelogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Changelog {0} not found.", id)));
    if(emojiDataRegistry.getEmojis().stream().noneMatch(e -> e.getId().equals(reactionId))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid reaction.");
    }
    Optional<ChangelogReaction> optional = changelog.getReactions().stream().filter(r -> r.getUser().equals(user) && r.getReactionId().equals(reactionId)).findFirst();
    if(!optional.isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet reacted.");
    }
    ChangelogReaction reaction = optional.get();

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.CHANGELOG_UNREACT)
            .withBoard(changelog.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(changelog, reaction)
            .build()
    );
    changelog.getReactions().remove(reaction);
    reaction.setChangelog(null);
    changelogRepository.save(changelog);
    //no need to expose
    return ResponseEntity.noContent(). build();
  }

}
