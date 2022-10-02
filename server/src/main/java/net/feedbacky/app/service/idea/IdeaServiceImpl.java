package net.feedbacky.app.service.idea;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.board.webhook.WebhookExecutor;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchVotersDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.idea.subscribe.NotificationEvent;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
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
import net.feedbacky.app.repository.idea.AttachmentRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RandomNicknameUtils;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;
import net.feedbacky.app.util.objectstorage.ObjectStorage;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.lang3.tuple.Pair;
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
import java.util.HashSet;
import java.util.List;
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
  private final IdeaServiceCommons ideaServiceCommons;
  private final MailHandler mailHandler;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  //todo too big constructor
  public IdeaServiceImpl(IdeaRepository ideaRepository, BoardRepository boardRepository, UserRepository userRepository, TagRepository tagRepository,
                         CommentRepository commentRepository, AttachmentRepository attachmentRepository, ObjectStorage objectStorage,
                         SubscriptionExecutor subscriptionExecutor, IdeaServiceCommons ideaServiceCommons, MailHandler mailHandler, TriggerExecutor triggerExecutor) {
    this.ideaRepository = ideaRepository;
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.commentRepository = commentRepository;
    this.attachmentRepository = attachmentRepository;
    this.objectStorage = objectStorage;
    this.subscriptionExecutor = subscriptionExecutor;
    this.ideaServiceCommons = ideaServiceCommons;
    this.mailHandler = mailHandler;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeasByFilterQuery(String discriminator, int page, int pageSize, String filterQuery, SortType sort, String anonymousId) {
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    return ideaServiceCommons.getAllIdeasByFilterQuery(board, getRequestUser(anonymousId), page, pageSize, filterQuery, sort);
  }

  @Override
  public FetchIdeaDto getOne(long id, String anonymousId) {
    return ideaServiceCommons.getOne(getRequestUser(anonymousId), id);
  }

  private User getRequestUser(String anonymousId) {
    User user = null;
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if(auth instanceof AnonymousAuthenticationToken && anonymousId != null) {
      user = userRepository.findByEmail(anonymousId).orElse(null);
    } else if(auth instanceof UserAuthenticationToken) {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    return user;
  }

  @Override
  public ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator(), EntityGraphs.named("Board.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", dto.getDiscriminator())));
    return ResponseEntity.status(HttpStatus.CREATED).body(ideaServiceCommons.post(dto, board, user));
  }

  @Override
  public FetchIdeaDto patch(long id, PatchIdeaDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.patch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    //if modifying staff only fields throw exception if not a moderator
    if((dto.getOpen() != null || dto.getCommentingRestricted() != null || dto.getPinned() != null || dto.getAssignees() != null)
            && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    //either creator or moderator can apply edits
    if(!(idea.getCreator().equals(user) || ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user))) {
      throw new InsufficientPermissionsException();
    }

    handleTitleUpdate(idea, dto, user);
    handleStatusUpdate(idea, dto, user);
    handleAttachmentUpdate(idea, dto, user);
    handleAssigneeUpdate(idea, dto, user);

    idea.setDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(idea.getDescription())));
    idea = ideaRepository.save(idea);
    return idea.toDto().withUser(idea, user);
  }

  private void handleTitleUpdate(Idea idea, PatchIdeaDto dto, User user) {
    if(dto.getTitle() == null) {
      return;
    }
    long creationTimeDiffMillis = Math.abs(Calendar.getInstance().getTime().getTime() - idea.getCreationDate().getTime());
    long minutesDiff = TimeUnit.MINUTES.convert(creationTimeDiffMillis, TimeUnit.MILLISECONDS);
    //title edit is only for moderators after 15 base minutes have passed
    if(minutesDiff > 15 && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException("Cannot edit title after 15 minutes have passed.");
    }
    String oldTitle = idea.getTitle();
    idea.setTitle(dto.getTitle());
    CommentBuilder commentBuilder = new CommentBuilder()
            .of(idea)
            .by(user)
            .type(Comment.SpecialType.IDEA_TITLE_CHANGE)
            .placeholders(user.convertToSpecialCommentMention(), CommentBuilder.convertToDiffViewMode("View Diff", oldTitle, dto.getTitle()));
    Comment comment = commentBuilder.build();
    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_EDIT)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );

    Set<Comment> comments = idea.getComments();
    comments.add(comment);
    idea.setComments(comments);
    commentRepository.save(comment);
  }

  private void handleStatusUpdate(Idea idea, PatchIdeaDto dto, User user) {
    boolean edited = false;
    long creationTimeDiffMillis = Math.abs(Calendar.getInstance().getTime().getTime() - idea.getCreationDate().getTime());
    long minutesDiff = TimeUnit.MINUTES.convert(creationTimeDiffMillis, TimeUnit.MILLISECONDS);
    //mark ideas edited only if they were posted later than 5 minutes for any typo fixes etc.
    if(dto.getDescription() != null
            && !idea.getDescription().equals(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(dto.getDescription())))
            && minutesDiff > 5) {
      edited = true;
      idea.setEdited(true);
    }
    Comment comment = null;
    CommentBuilder commentBuilder = new CommentBuilder().of(idea).by(user);
    ActionTrigger.Trigger triggerType = null;
    //assuming you can never do any of these actions together
    if(edited) {
      comment = commentBuilder.type(Comment.SpecialType.IDEA_EDITED).placeholders(user.convertToSpecialCommentMention()).build();
      triggerType = ActionTrigger.Trigger.IDEA_EDIT;
    } else if(dto.getOpen() != null && idea.getStatus().getValue() != dto.getOpen()) {
      if(!dto.getOpen()) {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_CLOSED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_CLOSE;
      } else {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_OPENED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_OPEN;
      }
      subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_STATUS_CHANGE, user,
              idea, idea.getStatus().name()));
    } else if(dto.getCommentingRestricted() != null && idea.isCommentingRestricted() != dto.getCommentingRestricted()) {
      if(dto.getCommentingRestricted()) {
        comment = commentBuilder.type(Comment.SpecialType.COMMENTS_RESTRICTED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_COMMENTS_DISABLE;
      } else {
        comment = commentBuilder.type(Comment.SpecialType.COMMENTS_ALLOWED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_COMMENTS_ENABLE;
      }
    } else if(dto.getPinned() != null && idea.isPinned() != dto.getPinned()) {
      if(dto.getPinned()) {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_PINNED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_PIN;
      } else {
        comment = commentBuilder.type(Comment.SpecialType.IDEA_UNPINNED).placeholders(user.convertToSpecialCommentMention()).build();
        triggerType = ActionTrigger.Trigger.IDEA_UNPIN;
      }
    }
    //the change was made, notify webhooks and save moderation comment
    if(comment != null) {
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(triggerType)
              .withBoard(idea.getBoard())
              .withTriggerer(user)
              .withRelatedObjects(idea)
              .build()
      );

      Set<Comment> comments = idea.getComments();
      comments.add(comment);
      idea.setComments(comments);
      commentRepository.save(comment);
    }
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, idea);
    if(dto.getOpen() != null) {
      idea.setStatus(Idea.IdeaStatus.toIdeaStatus(dto.getOpen()));
    }
  }

  private void handleAttachmentUpdate(Idea idea, PatchIdeaDto dto, User user) {
    if(dto.getAttachment() == null) {
      return;
    }
    Set<Attachment> attachments = new HashSet<>();
    String link = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getAttachment()), ObjectStorage.ImageType.ATTACHMENT);
    Attachment attachment = new Attachment();
    attachment.setIdea(idea);
    attachment.setUrl(link);
    attachment = attachmentRepository.save(attachment);
    attachments.add(attachment);
    idea.setAttachments(attachments);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_ATTACHMENT_UPDATE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
  }

  private void handleAssigneeUpdate(Idea idea, PatchIdeaDto dto, User user) {
    if(dto.getAssignees() == null) {
      return;
    }
    //left: new entries, right: entries to remove
    Pair<List<User>, List<User>> updatedEntries = Pair.of(new ArrayList<>(), new ArrayList<>());
    boolean assigneesDiffer = false;
    //check for new added entries
    for(Long assigneeId : dto.getAssignees()) {
      if(idea.getAssignedModerators().stream().noneMatch(u -> u.getId().equals(assigneeId))) {
        updatedEntries.getLeft().add(userRepository.findById(assigneeId)
                .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Assignee with id {0} not found.", assigneeId))));
        assigneesDiffer = true;
      }
    }
    //check for removed entries
    for(User assignee : idea.getAssignedModerators()) {
      if(!dto.getAssignees().contains(assignee.getId())) {
        updatedEntries.getRight().add(assignee);
        assigneesDiffer = true;
        break;
      }
    }
    if(!assigneesDiffer) {
      return;
    }
    //assign feature is only for moderators
    if(!ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    Set<Comment> comments = idea.getComments();
    Set<User> assignees = idea.getAssignedModerators();
    for(User toAssign : updatedEntries.getLeft()) {
      CommentBuilder commentBuilder = new CommentBuilder()
              .by(user)
              .type(Comment.SpecialType.IDEA_ASSIGNED)
              .placeholders(toAssign.convertToSpecialCommentMention(), user.convertToSpecialCommentMention());
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(ActionTrigger.Trigger.IDEA_ASSIGN)
              .withBoard(idea.getBoard())
              .withTriggerer(user)
              .withRelatedObjects(idea)
              .build()
      );
      assignees.add(toAssign);
      Comment comment = commentBuilder.of(idea).build();
      comments.add(comment);
      commentRepository.save(comment);
      MailBuilder builder = new MailBuilder();
      builder.withTemplate(MailService.EmailTemplate.IDEA_ASSIGNED)
              .withRecipient(toAssign)
              .withCustomPlaceholder("${idea.name}", idea.getTitle())
              .withCustomPlaceholder("${idea.viewLink}", idea.toViewLink())
              .sendMail(mailHandler.getMailService()).async();
    }
    for(User toUnassign : updatedEntries.getRight()) {
      CommentBuilder commentBuilder = new CommentBuilder()
              .by(user)
              .type(Comment.SpecialType.IDEA_UNASSIGNED)
              .placeholders(user.convertToSpecialCommentMention(), toUnassign.convertToSpecialCommentMention());
      triggerExecutor.executeTrigger(new ActionTriggerBuilder()
              .withTrigger(ActionTrigger.Trigger.IDEA_UNASSIGN)
              .withBoard(idea.getBoard())
              .withTriggerer(user)
              .withRelatedObjects(idea)
              .build()
      );
      assignees.remove(toUnassign);
      Comment comment = commentBuilder.of(idea).build();
      comments.add(comment);
      commentRepository.save(comment);
    }
    idea.setAssignedModerators(assignees);
    idea.setComments(comments);
  }

  @Override
  public ResponseEntity delete(long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getCreator().equals(user) && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    idea.getAttachments().forEach(attachment -> objectStorage.deleteImage(attachment.getUrl()));

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_DELETE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    ideaRepository.delete(idea);
    return ResponseEntity.noContent().build();
  }

  @Override
  public List<FetchSimpleUserDto> getAllMentions(long id) {
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetchMentions"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    Set<User> uniqueUsers = new HashSet<>();
    uniqueUsers.add(idea.getCreator());
    for(Comment comment : idea.getComments()) {
      if(comment.getViewType() == Comment.ViewType.DELETED) {
        continue;
      }
      uniqueUsers.add(comment.getCreator());
    }
    for(Moderator moderator : idea.getBoard().getModerators()) {
      uniqueUsers.add(moderator.getUser());
    }
    return uniqueUsers.stream().filter(u -> !u.isFake()).map(u -> new FetchSimpleUserDto().from(u)).collect(Collectors.toList());
  }

  @Override
  public List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.patchTags"))
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
    Set<Comment> comments = idea.getComments();
    comments.add(comment);
    idea.setComments(comments);
    commentRepository.save(comment);
    idea = ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_TAGS_CHANGE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    subscriptionExecutor.notifySubscribers(idea, new NotificationEvent(SubscriptionExecutor.Event.IDEA_TAGS_CHANGE, user,
            idea, user.getUsername() + " has " + prepareTagChangeMessage(idea, addedTags, removedTags, false)));
    return idea.getTags().stream().map(Tag::toDto).collect(Collectors.toList());
  }

  private Comment prepareTagsPatchComment(User user, Idea idea, List<Tag> addedTags, List<Tag> removedTags) {
    return new CommentBuilder()
            .of(idea)
            .by(user)
            .type(Comment.SpecialType.TAGS_MANAGED)
            .placeholders(user.convertToSpecialCommentMention(), prepareTagChangeMessage(idea, addedTags, removedTags, true))
            .build();
  }

  private String prepareTagChangeMessage(Idea idea, List<Tag> addedTags, List<Tag> removedTags, boolean tagDataDisplay) {
    StringBuilder builder = new StringBuilder();
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
      if(!builder.toString().isEmpty()) {
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
