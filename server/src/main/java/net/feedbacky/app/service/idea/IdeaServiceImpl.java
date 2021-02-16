package net.feedbacky.app.service.idea;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;
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
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.AttachmentRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestValidator;
import net.feedbacky.app.util.SortFilterResolver;
import net.feedbacky.app.util.objectstorage.ObjectStorage;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
  private final AttachmentRepository attachmentRepository;
  private final ObjectStorage objectStorage;
  private final SubscriptionExecutor subscriptionExecutor;

  @Autowired
  //todo too big constructor
  public IdeaServiceImpl(IdeaRepository ideaRepository, BoardRepository boardRepository, UserRepository userRepository, TagRepository tagRepository,
                         CommentRepository commentRepository, AttachmentRepository attachmentRepository, ObjectStorage objectStorage, SubscriptionExecutor subscriptionExecutor) {
    this.ideaRepository = ideaRepository;
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.commentRepository = commentRepository;
    this.attachmentRepository = attachmentRepository;
    this.objectStorage = objectStorage;
    this.subscriptionExecutor = subscriptionExecutor;
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
    //not using board.getIdeas() because it would load all, we need paged limited list
    Page<Idea> pageData;
    switch(filter) {
      case OPENED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.OPENED, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      case CLOSED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.CLOSED, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      case ALL:
        pageData = ideaRepository.findByBoard(board, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      default:
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid filter type.");
    }
    List<Idea> ideas = pageData.getContent();
    final User finalUser = user;
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream()
            .map(idea -> new FetchIdeaDto().from(idea).withUser(idea, finalUser)).collect(Collectors.toList()));
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
    final User finalUser = user;
    Page<Idea> pageData = ideaRepository.findByBoardAndTitleIgnoreCaseContaining(board, query, PageRequest.of(page, pageSize));
    List<Idea> ideas = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream()
            .map(idea -> new FetchIdeaDto().from(idea).withUser(idea, finalUser)).collect(Collectors.toList()));
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
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    return new FetchIdeaDto().from(idea).withUser(idea, user);
  }

  @Override
  public ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", dto.getDiscriminator())));
    Optional<Idea> optional = ideaRepository.findByTitleAndBoard(dto.getTitle(), board);
    if(optional.isPresent() && optional.get().getBoard().getId().equals(board.getId())) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with that title already exists.");
    }
    if(board.getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<Tag> tags = new HashSet<>();
    for(long tagId : dto.getTags()) {
      Tag tag = tagRepository.getOne(tagId);
      if(!tag.getBoard().equals(board)) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Tag {0} not found.", tag.getName()));
      }
      if(!tag.isPublicUse()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Tag {0} is private.", tag.getName()));
      }
      tags.add(tag);
    }
    ModelMapper mapper = new ModelMapper();
    Idea idea = mapper.map(dto, Idea.class);
    idea.setId(null);
    idea.setBoard(board);
    idea.setCreator(user);
    idea.setCreationDate(Calendar.getInstance().getTime());
    Set<User> set = new HashSet<>();
    set.add(user);
    idea.setVoters(set);
    idea.setTags(tags);
    idea.setStatus(Idea.IdeaStatus.OPENED);
    idea.setDescription(StringEscapeUtils.escapeHtml4(idea.getDescription()));
    idea.setSubscribers(set);
    idea = ideaRepository.save(idea);

    //must save idea first in order to apply and save attachment
    Set<Attachment> attachments = new HashSet<>();
    if(dto.getAttachment() != null) {
      String link = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getAttachment()), ObjectStorage.ImageType.ATTACHMENT);
      Attachment attachment = new Attachment();
      attachment.setIdea(idea);
      attachment.setUrl(link);
      attachment = attachmentRepository.save(attachment);
      attachments.add(attachment);
    }
    idea.setAttachments(attachments);
    ideaRepository.save(idea);

    FetchIdeaDto fetchDto = new FetchIdeaDto().from(idea).withUser(idea, user);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CREATE, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(fetchDto);
  }

  @Override
  public FetchIdeaDto patch(long id, PatchIdeaDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(dto.getOpen() != null && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("Insufficient permissions.");
    }
    if(!idea.getCreator().equals(user) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("Insufficient permissions.");
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
    //assuming you can never close and edit idea in the same request
    if(edited) {
      comment = new CommentBuilder()
              .of(idea)
              .by(user)
              .type(Comment.SpecialType.IDEA_EDITED)
              .message(user.convertToSpecialCommentMention() + " has edited description of the idea.")
              .build();
      WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
      idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_EDIT, builder.build());
    } else if(dto.getOpen() != null && idea.getStatus().getValue() != dto.getOpen()) {
      if(!dto.getOpen()) {
        comment = new CommentBuilder()
                .of(idea)
                .by(user)
                .type(Comment.SpecialType.IDEA_CLOSED)
                .message(user.convertToSpecialCommentMention() + " has closed the idea.")
                .build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CLOSE, builder.build());
      } else {
        comment = new CommentBuilder()
                .of(idea)
                .by(user)
                .type(Comment.SpecialType.IDEA_OPENED)
                .message(user.convertToSpecialCommentMention() + " has reopened the idea.")
                .build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_OPEN, builder.build());
      }
      subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_STATUS_CHANGE,
              idea, idea.getStatus().name()));
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
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getCreator().equals(user) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("Insufficient permissions.");
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
    if(idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already upvoted.");
    }
    if(!user.isFake() && idea.getBoard().getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<User> voters = idea.getVoters();
    voters.add(user);
    idea.setVoters(voters);
    ideaRepository.save(idea);
    return new FetchUserDto().from(user);
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
    if(!idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet upvoted.");
    }
    if(idea.getBoard().getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<User> voters = idea.getVoters();
    voters.remove(user);
    idea.setVoters(voters);
    ideaRepository.save(idea);
    return ResponseEntity.noContent().build();
  }

  private User createAnonymousUser(String anonymousId) {
    User user = new User();
    user.setEmail(anonymousId);
    MailPreferences preferences = new MailPreferences();
    preferences.setNotificationsEnabled(false);
    preferences.setUnsubscribeToken("");
    preferences.setUser(user);
    user.setMailPreferences(preferences);
    user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", "Anonymous"));
    user.setUsername("Anonymous");
    user.setFake(true);
    return userRepository.save(user);
  }

  @Override
  public List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("Insufficient permissions.");
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

    subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_TAGS_CHANGE,
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
