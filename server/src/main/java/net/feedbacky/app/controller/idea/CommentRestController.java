package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PatchCommentDto;
import net.feedbacky.app.data.idea.dto.comment.PostCommentDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.comment.CommentService;
import net.feedbacky.app.service.idea.IdeaService;
import net.feedbacky.app.util.PaginableRequest;

import org.apache.commons.lang3.math.NumberUtils;
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
    //todo can it be shorter
    int page = 0;
    if(requestParams.containsKey("page") && NumberUtils.isDigits(requestParams.get("page"))) {
      page = Integer.parseInt(requestParams.get("page"));
      if(page < 0) {
        page = 0;
      }
    }
    int pageSize = 20;
    if(requestParams.containsKey("pageSize") && NumberUtils.isDigits(requestParams.get("pageSize"))) {
      pageSize = Integer.parseInt(requestParams.get("pageSize"));
      if(pageSize < 1) {
        pageSize = 1;
      }
    }
    CommentService.SortType sortType = CommentService.SortType.OLDEST;
    if(requestParams.containsKey("sort")) {
      try {
        sortType = CommentService.SortType.valueOf(requestParams.get("sort").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    return commentService.getAllForIdea(ideaId, page, pageSize, sortType);
  }

  //todo needed? remove /v1/comments?
  @GetMapping("v1/comments/{id}")
  public FetchCommentDto getOne(@PathVariable long id) {
    return commentService.getOne(id);
  }

  //todo ideas insert NOT separate
  @PostMapping("v1/comments/")
  public ResponseEntity<FetchCommentDto> post(@Valid @RequestBody PostCommentDto dto) {
    return commentService.post(dto);
  }

  @PostMapping("v1/comments/{id}/likers")
  public FetchUserDto postLike(@PathVariable long id) {
    return commentService.postLike(id);
  }

  //todo ideas insert also with spearate
  @PatchMapping("v1/comments/{id}")
  public FetchCommentDto patch(@PathVariable long id, @Valid @RequestBody PatchCommentDto dto) {
    return commentService.patch(id, dto);
  }

  //todo ideas insert also with separate
  @DeleteMapping("v1/comments/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return commentService.delete(id);
  }

  @DeleteMapping("v1/comments/{id}/likers")
  public ResponseEntity deleteLike(@PathVariable long id) {
    return commentService.deleteLike(id);
  }

}
