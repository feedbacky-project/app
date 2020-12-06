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
import net.feedbacky.app.data.idea.subscribe.SubscriptionDataBuilder;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.User;
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

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeas(String discriminator, int page, int pageSize, FilterType filter, SortType sort) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
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
            .map(idea -> idea.convertToDto(finalUser)).collect(Collectors.toList()));
  }

  @Override
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeasContaining(String discriminator, int page, int pageSize, String query) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " does not exist."));
    final User finalUser = user;
    Page<Idea> pageData = ideaRepository.findByBoardAndTitleIgnoreCaseContaining(board, query, PageRequest.of(page, pageSize));
    List<Idea> ideas = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream()
            .map(idea -> idea.convertToDto(finalUser)).collect(Collectors.toList()));
  }

  @Override
  public FetchIdeaDto getOne(long id) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Idea idea = ideaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " not found"));
    return idea.convertToDto(user);
  }

  @Override
  public ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator())
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + dto.getDiscriminator() + " not found."));
    Optional<Idea> optional = ideaRepository.findByTitleAndBoard(dto.getTitle(), board);
    if(optional.isPresent() && optional.get().getBoard().getId().equals(board.getId())) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with that title in that board already exists.");
    }
    if(board.getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
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

    FetchIdeaDto fetchDto = idea.convertToDto(user);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CREATE, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(fetchDto);
  }

  @Override
  public FetchIdeaDto patch(long id, PatchIdeaDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(dto.getOpen() != null && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to patch idea 'open' field with id " + id + ".");
    }
    if(!idea.getCreator().equals(user) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to patch idea with id " + id + ".");
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
      SubscriptionDataBuilder builder = new SubscriptionDataBuilder().withUser(user).withIdea(idea).withComment(comment);
      subscriptionExecutor.notifySubscribers(idea, SubscriptionExecutor.Event.IDEA_STATUS_CHANGE, builder.build());
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
    return idea.convertToDto(user);
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(!idea.getCreator().equals(user) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to delete idea with id " + id + ".");
    }
    idea.getAttachments().forEach(attachment -> objectStorage.deleteImage(attachment.getUrl()));
    ideaRepository.delete(idea);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_DELETE, builder.build());
    return ResponseEntity.noContent().build();
  }

  @Override
  public List<FetchUserDto> getAllVoters(long id) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    return idea.getVoters().stream().map(usr -> usr.convertToDto().exposeSensitiveData(false)).collect(Collectors.toList());
  }

  @Override
  public FetchUserDto postUpvote(long id) {
    //todo X-User-Id vote on behalf
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with id " + id + " is already upvoted by you.");
    }
    if(idea.getBoard().getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<User> voters = idea.getVoters();
    voters.add(user);
    idea.setVoters(voters);
    ideaRepository.save(idea);
    //no need to expose
    return user.convertToDto().exposeSensitiveData(false);
  }

  @Override
  public ResponseEntity deleteUpvote(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(!idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with id " + id + " is not upvoted by you.");
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

  @Override
  public List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(!hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to modify tags for idea with id " + id + ".");
    }
    if(tags.isEmpty()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No changes made to idea.");
    }
    List<Tag> addedTags = new ArrayList<>();
    List<Tag> removedTags = new ArrayList<>();
    for(PatchTagRequestDto preTag : tags) {
      Tag tag = tagRepository.findByBoardAndName(idea.getBoard(), preTag.getName())
              .orElseThrow(() -> new ResourceNotFoundException("Tag with name " + preTag + " does not exist."));
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
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No changes made to idea.");
    }
    Comment comment = prepareTagsPatchComment(user, idea, addedTags, removedTags);
    idea.getComments().add(comment);
    commentRepository.save(comment);
    ideaRepository.save(idea);
    WebhookDataBuilder webhookBuilder = new WebhookDataBuilder().withUser(user).withIdea(comment.getIdea())
            .withTagsChangedData(prepareTagChangeMessage(user, idea, addedTags, removedTags, false));
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_TAG_CHANGE, webhookBuilder.build());

    SubscriptionDataBuilder subscriptionBuilder = new SubscriptionDataBuilder().withUser(user).withIdea(idea).withComment(comment)
            .withTagsChangedData(prepareTagChangeMessage(user, idea, addedTags, removedTags, false));
    subscriptionExecutor.notifySubscribers(idea, SubscriptionExecutor.Event.IDEA_TAGS_CHANGE, subscriptionBuilder.build());
    return idea.getTags().stream().map(Tag::convertToDto).collect(Collectors.toList());
  }

  private Comment prepareTagsPatchComment(User user, Idea idea, List<Tag> addedTags, List<Tag> removedTags) {
    return new CommentBuilder()
            .of(idea)
            .by(user)
            .type(Comment.SpecialType.TAGS_MANAGED)
            .message(prepareTagChangeMessage(user, idea, addedTags, removedTags, true))
            .build();
  }

  private String prepareTagChangeMessage(User user, Idea idea, List<Tag> addedTags, List<Tag> removedTags, boolean htmlDisplay) {
    StringBuilder builder = new StringBuilder(user.convertToSpecialCommentMention() + " has ");
    if(!addedTags.isEmpty()) {
      builder.append("added");
      for(Tag tag : addedTags) {
        idea.getTags().add(tag);
        builder.append(" ");
        if(htmlDisplay) {
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
        if(htmlDisplay) {
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
