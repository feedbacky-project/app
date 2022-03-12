package net.feedbacky.app.controller.comment;

import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PatchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PostCommentDto;
import net.feedbacky.app.data.idea.dto.comment.reaction.FetchCommentReactionDto;
import net.feedbacky.app.data.idea.dto.comment.reaction.PostCommentReactionDto;
import net.feedbacky.app.service.comment.CommentService;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestParamsParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@CrossOrigin
@RestController
public class CommentRestController {

  private final CommentService commentService;

  @Autowired
  public CommentRestController(CommentService commentService) {
    this.commentService = commentService;
  }

  @GetMapping("v1/ideas/{ideaId}/comments")
  public PaginableRequest<List<FetchCommentDto>> getAllForIdea(@PathVariable long ideaId, @RequestParam Map<String, String> requestParams) {
    CommentService.SortType sortType = CommentService.SortType.OLDEST;
    if(requestParams.containsKey("sort")) {
      try {
        sortType = CommentService.SortType.valueOf(requestParams.get("sort").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    return commentService.getAllForIdea(ideaId, parser.getPage(), parser.getPageSize(), sortType);
  }

  @GetMapping("v1/comments/{id}")
  public FetchCommentDto getOne(@PathVariable long id) {
    return commentService.getOne(id);
  }

  @PostMapping("v1/comments/")
  public ResponseEntity<FetchCommentDto> post(@Valid @RequestBody PostCommentDto dto) {
    return commentService.post(dto);
  }

  @PostMapping("v1/comments/{id}/reactions")
  public FetchCommentReactionDto postReaction(@PathVariable long id, @Valid @RequestBody PostCommentReactionDto dto) {
    return commentService.postReaction(id, dto);
  }

  @PatchMapping("v1/comments/{id}")
  public FetchCommentDto patch(@PathVariable long id, @Valid @RequestBody PatchCommentDto dto) {
    return commentService.patch(id, dto);
  }

  @DeleteMapping("v1/comments/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return commentService.delete(id);
  }

  @DeleteMapping("v1/comments/{id}/reactions/{reactionId}")
  public ResponseEntity deleteReaction(@PathVariable long id, @PathVariable String reactionId) {
    return commentService.deleteReaction(id, reactionId);
  }

}
