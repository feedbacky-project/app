package net.feedbacky.app.service.idea;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.AttachmentRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.moderator.Moderator;
import net.feedbacky.app.rest.data.board.webhook.Webhook;
import net.feedbacky.app.rest.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.rest.data.idea.Idea;
import net.feedbacky.app.rest.data.idea.attachment.Attachment;
import net.feedbacky.app.rest.data.idea.comment.Comment;
import net.feedbacky.app.rest.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.rest.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.rest.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.rest.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.rest.data.idea.dto.attachment.PostAttachmentDto;
import net.feedbacky.app.rest.data.tag.Tag;
import net.feedbacky.app.rest.data.tag.dto.FetchTagDto;
import net.feedbacky.app.rest.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.rest.data.user.User;
import net.feedbacky.app.rest.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.utils.Base64Utils;
import net.feedbacky.app.utils.CommentBuilder;
import net.feedbacky.app.utils.EmojiFilter;
import net.feedbacky.app.utils.PaginableRequest;
import net.feedbacky.app.utils.Pair;
import net.feedbacky.app.utils.RequestValidator;
import net.feedbacky.app.utils.SortFilterResolver;
import net.feedbacky.app.utils.objectstorage.ObjectStorage;

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

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Service
public class IdeaServiceImpl implements IdeaService {

  private IdeaRepository ideaRepository;
  private BoardRepository boardRepository;
  private UserRepository userRepository;
  private TagRepository tagRepository;
  private CommentRepository commentRepository;
  private AttachmentRepository attachmentRepository;
  private ObjectStorage objectStorage;

  @Autowired
  //todo too big constructor
  public IdeaServiceImpl(IdeaRepository ideaRepository, BoardRepository boardRepository, UserRepository userRepository, TagRepository tagRepository, CommentRepository commentRepository, AttachmentRepository attachmentRepository, ObjectStorage objectStorage) {
    this.ideaRepository = ideaRepository;
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
    this.commentRepository = commentRepository;
    this.attachmentRepository = attachmentRepository;
    this.objectStorage = objectStorage;
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
    if(!board.canView(user)) {
      return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, 0, pageSize), new ArrayList<>());
    }
    //not using board.getIdeas() because it would load all, we need paged limited list
    Page<Idea> pageData;
    switch(filter) {
      case OPENED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.OPENED, PageRequest.of(page, pageSize, SortFilterResolver.resolveSorting(sort)));
        break;
      case CLOSED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.CLOSED, PageRequest.of(page, pageSize, SortFilterResolver.resolveSorting(sort)));
        break;
      case ALL:
        pageData = ideaRepository.findByBoard(board, PageRequest.of(page, pageSize, SortFilterResolver.resolveSorting(sort)));
        break;
      default:
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid filter type.");
    }
    List<Idea> ideas = pageData.getContent();
    final User finalUser = user;
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream().map(idea -> {
      boolean upvoted = false;
      if(finalUser != null && idea.getVoters().contains(finalUser)) {
        upvoted = true;
      }
      return idea.convertToDto(upvoted);
    }).collect(Collectors.toList()));
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
    if(!board.canView(user)) {
      return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, 0, pageSize), new ArrayList<>());
    }
    final User finalUser = user;
    Page<Idea> pageData = ideaRepository.findByBoardAndTitleIgnoreCaseContaining(board, query, PageRequest.of(page, pageSize));
    List<Idea> ideas = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream().map(idea -> {
      boolean upvoted = false;
      if(finalUser != null && idea.getVoters().contains(finalUser)) {
        upvoted = true;
      }
      return idea.convertToDto(upvoted);
    }).collect(Collectors.toList()));
  }

  @Override
  public FetchIdeaDto getOne(long id) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Idea idea = ideaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " not found"));
    if(!idea.getBoard().canView(user)) {
      FetchIdeaDto dto = new FetchIdeaDto();
      dto.setId(idea.getId());
      dto.setBoardDiscriminator(idea.getBoard().getDiscriminator());
      return dto;
    }
    final User finalUser = user;
    boolean upvoted = false;
    if(finalUser != null && idea.getVoters().contains(finalUser)) {
      upvoted = true;
    }
    return idea.convertToDto(upvoted);
  }

  @Override
  public ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator())
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + dto.getDiscriminator() + " not found."));
    if(!board.canView(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No permission to post ideas in this board.");
    }
    Optional<Idea> optional = ideaRepository.findByTitleAndBoard(dto.getTitle(), board);
    if(optional.isPresent() && optional.get().getBoard().getId().equals(board.getId())) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with that title in that board already exists.");
    }
    ModelMapper mapper = new ModelMapper();
    Idea idea = mapper.map(dto, Idea.class);
    idea.setId(null);
    idea.setBoard(board);
    idea.setCreator(user);
    Set<User> set = new HashSet<>();
    set.add(user);
    idea.setVoters(set);
    idea.setStatus(Idea.IdeaStatus.OPENED);
    idea.setDescription(StringEscapeUtils.escapeHtml4(EmojiFilter.replaceEmojisPreSanitized(idea.getDescription())));
    idea = ideaRepository.save(idea);

    //must save idea first in order to apply and save attachment
    Set<Attachment> attachments = new HashSet<>();
    if(dto.getAttachment() != null) {
      try {
        String link = objectStorage.storeEncodedAttachment(idea, Base64Utils.ImageType.ATTACHMENT, Base64Utils.extractBase64Data(dto.getAttachment()));
        Attachment attachment = new Attachment();
        attachment.setIdea(idea);
        attachment.setUrl(link);
        attachment = attachmentRepository.save(attachment);
        attachments.add(attachment);
      } catch(IOException e) {
        e.printStackTrace();
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload attachment for idea.");
      }
    }
    idea.setAttachments(attachments);
    ideaRepository.save(idea);

    FetchIdeaDto fetchDto = idea.convertToDto(true);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CREATE, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(fetchDto);
  }

  @Override
  public ResponseEntity<FetchAttachmentDto> postAttachment(long id, PostAttachmentDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    if(!idea.getCreator().getId().equals(user.getId())) {
      throw new InvalidAuthenticationException("No permission to post attachment to this idea.");
    }
    if(idea.getAttachments().size() >= 3) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You can upload maximum of 3 attachments.");
    }
    Attachment attachment = new Attachment();
    attachment.setIdea(idea);
    try {
      attachment.setUrl(objectStorage.storeEncodedImage(idea.getBoard(), Base64Utils.ImageType.ATTACHMENT, Base64Utils.extractBase64Data(dto.getData())));
    } catch(IOException e) {
      e.printStackTrace();
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload attachment.");
    }
    attachment = attachmentRepository.save(attachment);
    idea.getAttachments().add(attachment);
    ideaRepository.save(idea);
    return ResponseEntity.status(HttpStatus.CREATED).body(attachment.convertToDto());
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
    if(dto.getDescription() != null && !idea.getDescription().equals(StringEscapeUtils.escapeHtml4(EmojiFilter.replaceEmojisPreSanitized(dto.getDescription())))) {
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
              .message(user.getUsername() + " has edited description of the idea.")
              .build();
      WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
      idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_EDIT, builder.build());
    } else if(dto.getOpen() != null && idea.getStatus().getValue() != dto.getOpen()) {
      if(!dto.getOpen()) {
        comment = new CommentBuilder()
                .of(idea)
                .by(user)
                .type(Comment.SpecialType.IDEA_CLOSED)
                .message(user.getUsername() + " has closed the idea.")
                .build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_CLOSE, builder.build());
      } else {
        comment = new CommentBuilder()
                .of(idea)
                .by(user)
                .type(Comment.SpecialType.IDEA_OPENED)
                .message(user.getUsername() + " has reopened the idea.")
                .build();
        WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
        idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_OPEN, builder.build());
      }
    }
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, idea);
    if(dto.getOpen() != null) {
      idea.setStatus(Idea.IdeaStatus.toIdeaStatus(dto.getOpen()));
    }
    idea.setDescription(StringEscapeUtils.escapeHtml4(EmojiFilter.replaceEmojisPreSanitized(idea.getDescription())));
    if(comment != null) {
      idea.getComments().add(comment);
      commentRepository.save(comment);
    }
    ideaRepository.save(idea);
    return idea.convertToDto(idea.getVoters().contains(user));
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
    idea.getAttachments().forEach(attachment -> objectStorage.deleteAttachment(attachment));
    ideaRepository.delete(idea);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_DELETE, builder.build());
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deleteAttachment(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment with id " + id + " does not exist."));
    Idea idea = attachment.getIdea();
    if(!idea.getCreator().equals(user) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to delete attachment with id " + id + ".");
    }
    objectStorage.deleteAttachment(attachment);
    idea.getAttachments().remove(attachment);
    attachmentRepository.delete(attachment);
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
    if(!idea.getBoard().canView(user)) {
      return new ArrayList<>();
    }
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
    if(!idea.getBoard().canView(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No permission to vote to that idea.");
    }
    if(idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with id " + id + " is already upvoted by you.");
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
    if(!idea.getBoard().canView(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No permission to vote to that idea.");
    }
    if(!idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with id " + id + " is not upvoted by you.");
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
    //key - added tags, value - removed tags
    Pair<List<Tag>, List<Tag>> tagsUpdated = new Pair<>(new ArrayList<>(), new ArrayList<>());
    for(PatchTagRequestDto preTag : tags) {
      Tag tag = tagRepository.findByBoardAndName(idea.getBoard(), preTag.getName())
              .orElseThrow(() -> new ResourceNotFoundException("Tag with name " + preTag + " does not exist."));
      for(Tag ideaTag : idea.getBoard().getTags()) {
        if(!ideaTag.getName().equals(preTag.getName())) {
          continue;
        }
        if(preTag.getApply() && !idea.getTags().contains(tag)) {
          tagsUpdated.getKey().add(tag);
        } else if(!preTag.getApply() && idea.getTags().contains(tag)) {
          tagsUpdated.getValue().add(tag);
        }
      }
    }
    if(tagsUpdated.getValue().isEmpty() && tagsUpdated.getKey().isEmpty()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No changes made to idea.");
    }
    Comment comment = prepareTagsPatchComment(user, idea, tagsUpdated);
    idea.getComments().add(comment);
    commentRepository.save(comment);
    ideaRepository.save(idea);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(comment.getIdea())
            .withTagsChangedData(prepareTagChangeMessage(user, idea, tagsUpdated, false));
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_TAG_CHANGE, builder.build());
    return idea.getTags().stream().map(Tag::convertToDto).collect(Collectors.toList());
  }

  private Comment prepareTagsPatchComment(User user, Idea idea, Pair<List<Tag>, List<Tag>> tagsUpdated) {
    return new CommentBuilder()
            .of(idea)
            .by(user)
            .type(Comment.SpecialType.TAGS_MANAGED)
            .message(prepareTagChangeMessage(user, idea, tagsUpdated, true))
            .build();
  }

  private String prepareTagChangeMessage(User user, Idea idea, Pair<List<Tag>, List<Tag>> tagsUpdated, boolean htmlDisplay) {
    StringBuilder builder = new StringBuilder(user.getUsername() + " has ");
    if(!tagsUpdated.getKey().isEmpty()) {
      builder.append("added");
      for(Tag tag : tagsUpdated.getKey()) {
        idea.getTags().add(tag);
        builder.append(" ");
        if(htmlDisplay) {
          builder.append(tag.getHtmlDisplay());
        } else {
          builder.append("`").append(tag.getName()).append("`");
        }
        builder.append(" ");
      }
      if(tagsUpdated.getKey().size() == 1) {
        builder.append("tag");
      } else {
        builder.append("tags");
      }
    }
    if(!tagsUpdated.getValue().isEmpty()) {
      //tags were added
      if(!builder.toString().endsWith("has ")) {
        builder.append(" and ");
      }
      builder.append("removed");
      for(Tag tag : tagsUpdated.getValue()) {
        idea.getTags().remove(tag);
        builder.append(" ");
        if(htmlDisplay) {
          builder.append(tag.getHtmlDisplay());
        } else {
          builder.append("`").append(tag.getName()).append("`");
        }
        builder.append(" ");
      }
      if(tagsUpdated.getValue().size() == 1) {
        builder.append("tag");
      } else {
        builder.append("tags");
      }
    }
    return builder.toString();
  }

}
