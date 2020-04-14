package net.feedbacky.app.service.comment;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookDataBuilder;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PatchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PostCommentDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestValidator;

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@Service
public class CommentServiceImpl implements CommentService {

  private CommentRepository commentRepository;
  private IdeaRepository ideaRepository;
  private UserRepository userRepository;

  @Autowired
  public CommentServiceImpl(CommentRepository commentRepository, IdeaRepository ideaRepository, UserRepository userRepository) {
    this.commentRepository = commentRepository;
    this.ideaRepository = ideaRepository;
    this.userRepository = userRepository;
  }

  @Override
  public PaginableRequest<List<FetchCommentDto>> getAllForIdea(long ideaId, int page, int pageSize) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Idea idea = ideaRepository.findById(ideaId)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + ideaId + " does not exist."));
    if(!idea.getBoard().canView(user)) {
      return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, 0, pageSize), new ArrayList<>());
    }
    Page<Comment> pageData = commentRepository.findByIdea(idea, PageRequest.of(page, pageSize, Sort.by("id").descending()));
    List<Comment> comments = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    final User finalUser = user;
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize),
            comments.stream().map(comment -> comment.convertToDto(finalUser)).collect(Collectors.toList()));
  }

  @Override
  public FetchCommentDto getOne(long id) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment with id " + id + " does not exist."));
    if(!comment.getIdea().getBoard().canView(user)) {
      FetchCommentDto dto = new FetchCommentDto();
      dto.setId(id);
      return dto;
    }
    return comment.convertToDto(user);
  }

  @Override
  public ResponseEntity<FetchCommentDto> post(PostCommentDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(dto.getIdeaId())
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + dto.getIdeaId() + " does not exist."));
    if(!idea.getBoard().canView(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "No permission to post comment to this idea.");
    }

    Comment comment = new ModelMapper().map(this, Comment.class);
    comment.setId(null);
    comment.setIdea(idea);
    comment.setCreator(user);
    comment.setLikers(new HashSet<>());
    comment.setSpecial(false);
    comment.setSpecialType(Comment.SpecialType.LEGACY);
    comment.setDescription(StringEscapeUtils.escapeHtml4(dto.getDescription()));

    if(commentRepository.findByCreatorAndDescriptionAndIdea(user, comment.getDescription(), idea).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Message with the same content posted by you already exist in this idea.");
    }
    commentRepository.save(comment);

    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(idea).withComment(comment);
    idea.getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_COMMENT, builder.build());
    return ResponseEntity.status(HttpStatus.CREATED).body(comment.convertToDto(user));
  }

  @Override
  public FetchUserDto postLike(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment with id " + id + " does not exist."));
    if(comment.isSpecial()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Cannot like special comments.");
    }
    if(comment.getLikers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Comment with id " + id + " is already liked by you.");
    }
    comment.getLikers().add(user);
    commentRepository.save(comment);
    //no need to expose
    return user.convertToDto().exposeSensitiveData(false);
  }

  @Override
  public FetchCommentDto patch(long id, PatchCommentDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Idea with id " + id + " does not exist."));
    Comment comment = commentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Comment with id " + id + " not found."));
    if(!comment.getCreator().getId().equals(user.getId()) && !hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to patch comment with id " + id + ".");
    }

    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, comment);

    comment.setDescription(StringEscapeUtils.escapeHtml4(comment.getDescription()));
    commentRepository.save(comment);
    return comment.convertToDto(user);
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment with id " + id + " does not exist."));
    if(!comment.getCreator().equals(user) && !hasPermission(comment.getIdea().getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InvalidAuthenticationException("No permission to delete comment with id " + id + ".");
    }
    commentRepository.delete(comment);
    WebhookDataBuilder builder = new WebhookDataBuilder().withUser(user).withIdea(comment.getIdea()).withComment(comment);
    comment.getIdea().getBoard().getWebhookExecutor().executeWebhooks(Webhook.Event.IDEA_COMMENT_DELETE, builder.build());
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deleteLike(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Comment comment = commentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment with id " + id + " does not exist."));
    if(comment.isSpecial()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Cannot unlike special comments.");
    }
    if(!comment.getLikers().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Comment with id " + id + " is not liked by you.");
    }
    comment.getLikers().remove(user);
    commentRepository.save(comment);
    //no need to expose
    return ResponseEntity.noContent().build();
  }
}
