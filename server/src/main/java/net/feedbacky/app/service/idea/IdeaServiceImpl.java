package net.feedbacky.app.service.idea;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.idea.subscribe.NotificationEvent;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RandomNicknameUtils;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.objectstorage.ObjectStorage;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Service
public class IdeaServiceImpl implements IdeaService {

  private final IdeaRepository ideaRepository;
  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final TagRepository tagRepository;
  private final CommentRepository commentRepository;
  private final ObjectStorage objectStorage;
  private final SubscriptionExecutor subscriptionExecutor;
  private final IdeaServiceCommons ideaServiceCommons;
  private final RandomNicknameUtils randomNicknameUtils;

  @Autowired
  //todo too big constructor
  public IdeaServiceImpl(IdeaRepository ideaRepository, BoardRepository boardRepository, UserRepository userRepository, TagRepository tagRepository,
                         CommentRepository commentRepository, ObjectStorage objectStorage, SubscriptionExecutor subscriptionExecutor,
                         IdeaServiceCommons ideaServiceCommons, RandomNicknameUtils randomNicknameUtils) {
    this.ideaRepository = ideaRepository;
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.commentRepository = commentRepository;
    this.objectStorage = objectStorage;
    this.subscriptionExecutor = subscriptionExecutor;
    this.ideaServiceCommons = ideaServiceCommons;
    this.randomNicknameUtils = randomNicknameUtils;
  }

  @Override
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeas(String discriminator, int page, int pageSize, FilterType filter, SortType sort, String anonymousId) {
    User user = null;
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth instanceof AnonymousAuthenticationToken && anonymousId != null) {
      user = userRepository.findByEmail(anonymousId).orElse(null);
    } else if(auth instanceof UserAuthenticationToken) {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    return ideaServiceCommons.getAllIdeas(board, user, page, pageSize, filter, sort);
  }

  @Override
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeasContaining(String discriminator, int page, int pageSize, String query, String anonymousId) {
    User user = null;
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth instanceof AnonymousAuthenticationToken && anonymousId != null) {
      user = userRepository.findByEmail(anonymousId).orElse(null);
    } else if(auth instanceof UserAuthenticationToken) {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    return ideaServiceCommons.getAllIdeasContaining(board, user, page, pageSize, query);
  }

  @Override
  public FetchIdeaDto getOne(long id, String anonymousId) {
    User user = null;
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth instanceof AnonymousAuthenticationToken && anonymousId != null) {
      user = userRepository.findByEmail(anonymousId).orElse(null);
    } else if(auth instanceof UserAuthenticationToken) {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    return ideaServiceCommons.getOne(user, id);
  }

  @Override
  public ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", dto.getDiscriminator())));
    return ResponseEntity.status(HttpStatus.CREATED).body(ideaServiceCommons.post(dto, board, user));
  }

  @Override
  public FetchIdeaDto patch(long id, PatchIdeaDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if((dto.getOpen() != null || dto.getCommentingRestricted() != null) && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    if(!idea.getCreator().equals(user) && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }

    boolean edited = false;
    long creationTimeDiffMillis = Math.abs(Calendar.getInstance().getTime().getTime() - idea.getCreationDate().getTime());
    long minutesDiff = TimeUnit.MINUTES.convert(creationTimeDiffMillis, TimeUnit.MILLISECONDS);
    //mark ideas edited only if they were posted later than 5 minutes for any typo fixes etc.
    if(dto.getDescription() != null && !idea.getDescription().equals(StringEscapeUtils.escapeHtml4(dto.getDescription())) && minutesDiff > 5) {
      edited = true;
      idea.setEdited(true);
    }
    Comment comment = null;
    CommentBuilder commentBuilder = new CommentBuilder().of(idea).by(user);
    //assuming you can never close and edit idea in the same request
    if(edited) {
      comment = commentBuilder.type(Comment.SpecialType.IDEA_EDITED).message(user.convertToSpecialCommentMention() + " has edited description of the idea.").build();
      WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
      idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_EDIT, builder.build());
    } else if(dto.getOpen() != null && idea.getStatus().getValue() != dto.getOpen()) {
      if(!dto.getOpen()) {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_CLOSED).message(user.convertToSpecialCommentMention() + " has closed the idea.").build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CLOSE, builder.build());
      } else {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_OPENED).message(user.convertToSpecialCommentMention() + " has reopened the idea.").build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_OPEN, builder.build());
      }
      subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_STATUS_CHANGE, user,
              idea, idea.getStatus().name()));
    } else if(dto.getCommentingRestricted() != null && idea.isCommentingRestricted() != dto.getCommentingRestricted()) {
      if(dto.getCommentingRestricted()) {
        comment = commentBuilder.type(Comment.SpecialType.COMMENTS_RESTRICTED).message(user.convertToSpecialCommentMention() + " has restricted commenting to moderators only.").build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_COMMENTS_RESTRICT, builder.build());
      } else {
        comment = commentBuilder.type(Comment.SpecialType.COMMENTS_ALLOWED).message(user.convertToSpecialCommentMention() + " has removed commenting restrictions.").build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_COMMENTS_ALLOW, builder.build());
      }
    }
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, idea);
    if(dto.getOpen() != null) {
      idea.setStatus(Idea.IdeaStatus.toIdeaStatus(dto.getOpen()));
    }
    idea.setDescription(StringEscapeUtils.escapeHtml4(idea.getDescription()));
    if(comment != null) {
      idea.getComments().add(comment);
      commentRepository.save(comment);
    }
    ideaRepository.save(idea);
    return new FetchIdeaDto().from(idea).withUser(idea, user);
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getCreator().equals(user) && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    idea.getAttachments().forEach(attachment -> objectStorage.deleteImage(attachment.getUrl()));
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_DELETE, builder.build());
    ideaRepository.delete(idea);
    return ResponseEntity.noContent().build();
  }

  @Override
  public List<FetchSimpleUserDto> getAllVoters(long id) {
    Idea idea = ideaRepository.findById(id, EntityGraphUtils.fromAttributePaths("voters"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    return idea.getVoters().stream().map(usr -> new FetchSimpleUserDto().from(usr)).collect(Collectors.toList());
  }

  @Override
  public FetchUserDto postUpvote(long id, String anonymousId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user;
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(auth instanceof AnonymousAuthenticationToken) {
      if(anonymousId == null || !idea.getBoard().isAnonymousAllowed()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Please log-in to vote.");
      }
      user = userRepository.findByEmail(anonymousId).orElseGet(() -> createAnonymousUser(anonymousId));
    } else {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
              .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    }
    return ideaServiceCommons.postUpvote(user, idea);
  }

  @Override
  public ResponseEntity deleteUpvote(long id, String anonymousId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user;
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(auth instanceof AnonymousAuthenticationToken) {
      if(anonymousId == null || !idea.getBoard().isAnonymousAllowed()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Please log-in to vote.");
      }
      //if not found and vote deleted then don't create new user
      user = userRepository.findByEmail(anonymousId)
              .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet upvoted."));
    } else {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
              .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    }
    return ideaServiceCommons.deleteUpvote(user, idea);
  }

  private User createAnonymousUser(String anonymousId) {
    User user = new User();
    user.setEmail(anonymousId);
    MailPreferences preferences = new MailPreferences();
    preferences.setNotificationsEnabled(false);
    preferences.setUnsubscribeToken("");
    preferences.setUser(user);
    user.setMailPreferences(preferences);
    String nick = randomNicknameUtils.getRandomNickname();
    user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", nick));
    user.setUsername(nick);
    user.setFake(true);
    return userRepository.save(user);
  }

  @Override
  public List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    if(tags.isEmpty()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No changes made.");
    }
    List<Tag> addedTags = new ArrayList<>();
    List<Tag> removedTags = new ArrayList<>();
    for(PatchTagRequestDto preTag : tags) {
      Tag tag = tagRepository.findByBoardAndName(idea.getBoard(), preTag.getName())
              .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Tag with name {0} not found.", preTag.getName())));
      for(Tag ideaTag : idea.getBoard().getTags()) {
        if(!ideaTag.getName().equals(preTag.getName())) {
          continue;
        }
        if(preTag.getApply() && !idea.getTags().contains(tag)) {
          addedTags.add(tag);
        } else if(!preTag.getApply() && idea.getTags().contains(tag)) {
          removedTags.add(tag);
        }
      }
    }
    if(removedTags.isEmpty() && addedTags.isEmpty()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No changes made.");
    }
    Comment comment = prepareTagsPatchComment(user, idea, addedTags, removedTags);
    idea.getComments().add(comment);
    commentRepository.save(comment);
    ideaRepository.save(idea);
    WebhookDataBuilder webhookBuilder = new WebhookDataBuilder().withUser(user).withIdea(comment.getIdea())
            .withTagsChangedData(prepareTagChangeMessage(user, idea, addedTags, removedTags, false));
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_TAG_CHANGE, webhookBuilder.build());

    subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_TAGS_CHANGE, user,
            idea, prepareTagChangeMessage(user, idea, addedTags, removedTags, false)));
    return idea.getTags().stream().map(tag -> new FetchTagDto().from(tag)).collect(Collectors.toList());
  }

  private Comment prepareTagsPatchComment(User user, Idea idea, List<Tag> addedTags, List<Tag> removedTags) {
    return new CommentBuilder()
            .of(idea)
            .by(user)
            .type(Comment.SpecialType.TAGS_MANAGED)
            .message(prepareTagChangeMessage(user, idea, addedTags, removedTags, true))
            .build();
  }

  private String prepareTagChangeMessage(User user, Idea idea, List<Tag> addedTags, List<Tag> removedTags, boolean tagDataDisplay) {
    String userName;
    if(tagDataDisplay) {
      userName = user.convertToSpecialCommentMention();
    } else {
      userName = user.getUsername();
    }
    StringBuilder builder = new StringBuilder(userName + " has ");
    if(!addedTags.isEmpty()) {
      builder.append("added");
      for(Tag tag : addedTags) {
        idea.getTags().add(tag);
        builder.append(" ");
        if(tagDataDisplay) {
          builder.append(tag.convertToSpecialCommentMention());
        } else {
          builder.append("`").append(tag.getName()).append("`");
        }
        builder.append(" ");
      }
      if(addedTags.size() == 1) {
        builder.append("tag");
      } else {
        builder.append("tags");
      }
    }
    if(!removedTags.isEmpty()) {
      //tags were added
      if(!builder.toString().endsWith("has ")) {
        builder.append(" and ");
      }
      builder.append("removed");
      for(Tag tag : removedTags) {
        idea.getTags().remove(tag);
        builder.append(" ");
        if(tagDataDisplay) {
          builder.append(tag.convertToSpecialCommentMention());
        } else {
          builder.append("`").append(tag.getName()).append("`");
        }
        builder.append(" ");
      }
      if(removedTags.size() == 1) {
        builder.append("tag");
      } else {
        builder.append("tags");
      }
    }
    return builder.toString();
  }

}
