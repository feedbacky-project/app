package net.feedbacky.app.service.comment;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.emoji.EmojiDataRegistry;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PatchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PostCommentDto;
import net.feedbacky.app.data.idea.dto.comment.reaction.FetchCommentReactionDto;
import net.feedbacky.app.data.idea.dto.comment.reaction.PostCommentReactionDto;
import net.feedbacky.app.data.idea.subscribe.NotificationEvent;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.filter.SortFilterResolver;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@Service
public class CommentServiceImpl implements CommentService {

  private final CommentRepository commentRepository;
  private final IdeaRepository ideaRepository;
  private final UserRepository userRepository;
  private final SubscriptionExecutor subscriptionExecutor;
  private final TriggerExecutor triggerExecutor;
  private final EmojiDataRegistry emojiDataRegistry;
  private final Pattern mentionPattern = Pattern.compile("(@[{a-zA-Z0-9_-}{^A-Za-z0-9 \\n}]+#[0-9]+)");

  @Autowired
  public CommentServiceImpl(CommentRepository commentRepository, IdeaRepository ideaRepository, UserRepository userRepository, SubscriptionExecutor subscriptionExecutor,
                            TriggerExecutor triggerExecutor, EmojiDataRegistry emojiDataRegistry) {
    this.commentRepository = commentRepository;
    this.ideaRepository = ideaRepository;
    this.userRepository = userRepository;
    this.subscriptionExecutor = subscriptionExecutor;
    this.triggerExecutor = triggerExecutor;
    this.emojiDataRegistry = emojiDataRegistry;
  }

  @Override
  public PaginableRequest<List<FetchCommentDto>> getAllForIdea(long ideaId, int page, int pageSize, SortType sortType) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Idea idea = ideaRepository.findById(ideaId, EntityGraphUtils.fromAttributePaths("board.moderators.user"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", ideaId)));
    Page<Comment> pageData = commentRepository.findByIdea(idea, PageRequest.of(page, pageSize, SortFilterResolver.resolveCommentsSorting(sortType)));
    List<Comment> comments = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    final User finalUser = user;
    AtomicBoolean isModerator = new AtomicBoolean(false);
    //only check if is moderator when logged in to avoid unnecessary Database lookups
    if(finalUser != null) {
      isModerator.set(idea.getBoard().getModerators().stream().anyMatch(mod -> mod.getUser().equals(finalUser)));
    }
    List<FetchCommentDto> returnData = comments.stream().map(c -> {
      FetchCommentDto dto = c.toDto();
      if(!isModerator.get() && c.getViewType() == Comment.ViewType.INTERNAL) {
        dto = dto.asInternalInvisible();
      }
      return dto;
    }).collect(Collectors.toList());
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), returnData);
  }

  @Override
  public FetchCommentDto getOne(long id) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Comment comment = commentRepository.findById(id, EntityGraphs.named("Comments.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Comment with id {0} not found.", id)));
    final User finalUser = user;
    boolean isModerator = false;
    if(finalUser != null) {
      isModerator = comment.getIdea().getBoard().getModerators().stream().anyMatch(mod -> mod.getUser().equals(finalUser));
    }
    if(comment.getViewType() == Comment.ViewType.INTERNAL && !isModerator) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No permission to view this comment.");
    }
    return comment.toDto();
  }

  @Override
  public ResponseEntity<FetchCommentDto> post(PostCommentDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(dto.getIdeaId(), EntityGraphUtils.fromAttributePaths("subscribers", "board.moderators.user", "board.webhooks"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", dto.getIdeaId())));
    if(idea.getStatus() == Idea.IdeaStatus.CLOSED && !idea.getBoard().isClosedIdeasCommentingEnabled()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea already closed.");
    }
    boolean isModerator = idea.getBoard().getModerators().stream().anyMatch(mod -> mod.getUser().equals(user));
    //1. internal type is for moderators only
    //2. restricted commenting is for moderators only
    if(!isModerator && (Comment.ViewType.valueOf(dto.getType().toUpperCase()) == Comment.ViewType.INTERNAL || idea.isCommentingRestricted())) {
      throw new InsufficientPermissionsException();
    }
    Comment comment = dto.convertToEntity(user, idea);
    comment.setViewType(Comment.ViewType.valueOf(dto.getType().toUpperCase()));
    comment.setDescription(StringEscapeUtils.escapeHtml4(dto.getDescription()));
    comment.setMetadata("{}");
    boolean isReply = false;
    if(dto.getReplyTo() != null) {
      Comment repliedComment = commentRepository.findById(dto.getReplyTo())
              .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Reply comment with id {0} not found.", dto.getReplyTo())));
      comment.setReplyTo(repliedComment);
      //author of idea and comment shouldn't receive notification about their own message
      if(!idea.getCreator().equals(user) && !repliedComment.getCreator().equals(user)) {
        subscriptionExecutor.notifySubscriber(idea, user, new NotificationEvent(SubscriptionExecutor.Event.COMMENT_REPLY, user,
                comment, StringEscapeUtils.unescapeHtml4(comment.getDescription())));
      }
      isReply = true;
    }

    if(commentRepository.findByCreatorAndDescriptionAndIdea(user, comment.getDescription(), idea).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Can't post duplicated comments.");
    }
    commentRepository.save(comment);
    //to force trend score update
    Set<Comment> comments = idea.getComments();
    comments.add(comment);
    idea.setComments(comments);
    ideaRepository.save(idea);

    notifyWebhooksAndSubscribers(comment, idea, user, isModerator);
    parseMentions(comment, idea, isReply);

    return ResponseEntity.status(HttpStatus.CREATED).body(comment.toDto());
  }

  private void notifyWebhooksAndSubscribers(Comment comment, Idea idea, User user, boolean isModerator) {
    //do not publish information about private internal comments
    if(comment.getViewType() != Comment.ViewType.INTERNAL) {
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(ActionTrigger.Trigger.COMMENT_CREATE)
              .withBoard(idea.getBoard())
              .withTriggerer(user)
              .withRelatedObjects(comment)
              .build()
      );
      //notify only if moderator
      if(isModerator) {
        subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_BY_MODERATOR_COMMENT, comment.getCreator(),
                comment, StringEscapeUtils.unescapeHtml4(comment.getDescription())));
      }
    }
  }

  private void parseMentions(Comment comment, Idea idea, boolean isReply) {
    Matcher mentions = mentionPattern.matcher(comment.getDescription());
    while(mentions.find()) {
      String mention = mentions.group();
      mention = mention.replace("@", "");
      String[] data = mention.split("#");
      //parse after last # in case username contains #
      long id = Long.parseLong(data[data.length - 1]);
      Optional<User> optional = userRepository.findById(id);
      if(!optional.isPresent()) {
        continue;
      }
      //do not notify about mention if we already notify about a reply
      if(isReply && optional.get().getId().equals(comment.getReplyTo().getId())) {
        continue;
      }
      subscriptionExecutor.notifySubscriber(idea, optional.get(), new NotificationEvent(SubscriptionExecutor.Event.COMMENT_MENTION, comment.getCreator(),
              comment, StringEscapeUtils.unescapeHtml4(comment.getDescription())));
    }
  }

  @Override
  public FetchCommentReactionDto postReaction(long id, PostCommentReactionDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Comment comment = commentRepository.findById(id, EntityGraphUtils.fromAttributePaths("reactions.user"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Comment with id {0} not found.", id)));
    if(comment.isSpecial()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Can't react to this comment.");
    }
    if(emojiDataRegistry.getEmojis().stream().noneMatch(e -> e.getId().equals(dto.getReactionId()))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid reaction.");
    }
    if(comment.getReactions().stream().anyMatch(r -> r.getUser().equals(user) && r.getReactionId().equals(dto.getReactionId()))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already reacted.");
    }
    CommentReaction reaction = new CommentReaction();
    reaction.setComment(comment);
    reaction.setReactionId(dto.getReactionId());
    reaction.setUser(user);
    comment.getReactions().add(reaction);
    commentRepository.save(comment);
    reaction = comment.getReactions().stream().filter(r -> r.getReactionId().equals(dto.getReactionId()) && r.getUser().equals(user)).findFirst().get();

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.COMMENT_REACT)
            .withBoard(comment.getIdea().getBoard())
            .withTriggerer(user)
            .withRelatedObjects(comment, reaction)
            .build()
    );
    return reaction.toDto();
  }

  @Override
  public FetchCommentDto patch(long id, PatchCommentDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Comment comment = commentRepository.findById(id, EntityGraphUtils.fromAttributePaths("reactions"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Comment with id {0} not found.", id)));
    if(!comment.getCreator().getId().equals(user.getId())) {
      throw new InsufficientPermissionsException();
    }

    long creationTimeDiffMillis = Math.abs(Calendar.getInstance().getTime().getTime() - comment.getCreationDate().getTime());
    long minutesDiff = TimeUnit.MINUTES.convert(creationTimeDiffMillis, TimeUnit.MILLISECONDS);
    //mark comments edited only if they were posted later than 5 minutes for any typo fixes etc.
    if(dto.getDescription() != null
            && !comment.getDescription().equals(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(comment.getDescription())))
            && minutesDiff > 5) {
      comment.setEdited(true);
    }

    comment.setDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(dto.getDescription())));
    comment = commentRepository.save(comment);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.COMMENT_EDIT)
            .withBoard(comment.getIdea().getBoard())
            .withTriggerer(user)
            .withRelatedObjects(comment)
            .build()
    );
    return comment.toDto();
  }

  @Override
  public ResponseEntity delete(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Comment comment = commentRepository.findById(id, EntityGraphUtils.fromAttributePaths("creator", "idea.voters", "idea.subscribers", "idea.comments", "idea.board", "idea.board.webhooks"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Comment with id {0} not found.", id)));
    if(!comment.getCreator().equals(user) && !ServiceValidator.hasPermission(comment.getIdea().getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    Idea idea = comment.getIdea();
    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.COMMENT_DELETE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(comment)
            .build()
    );

    comment.setViewType(Comment.ViewType.DELETED);
    comment.setCreator(null);
    comment.setDescription("");
    commentRepository.save(comment);
    //to force trend score update
    idea.setComments(idea.getComments());
    ideaRepository.save(idea);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deleteReaction(long id, String reactionId) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Comment comment = commentRepository.findById(id, EntityGraphUtils.fromAttributePaths("reactions.user"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Comment with id {0} not found.", id)));
    if(comment.isSpecial()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Can't react to this comment.");
    }
    if(emojiDataRegistry.getEmojis().stream().noneMatch(e -> e.getId().equals(reactionId))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid reaction.");
    }
    Optional<CommentReaction> optional = comment.getReactions().stream().filter(r -> r.getUser().equals(user) && r.getReactionId().equals(reactionId)).findFirst();
    if(!optional.isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet reacted.");
    }
    CommentReaction reaction = optional.get();

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.COMMENT_UNREACT)
            .withBoard(comment.getIdea().getBoard())
            .withTriggerer(user)
            .withRelatedObjects(comment, reaction)
            .build()
    );
    comment.getReactions().remove(reaction);
    reaction.setComment(null);
    commentRepository.save(comment);
    //no need to expose
    return ResponseEntity.noContent().build();
  }
}
