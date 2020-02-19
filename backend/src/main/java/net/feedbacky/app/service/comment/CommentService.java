package net.feedbacky.app.service.comment;

import java.util.List;

import net.feedbacky.app.rest.data.idea.dto.comment.PatchCommentDto;

import org.springframework.http.ResponseEntity;

import net.feedbacky.app.rest.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.rest.data.idea.dto.comment.PostCommentDto;
import net.feedbacky.app.rest.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.FeedbackyService;
import net.feedbacky.app.utils.PaginableRequest;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
public interface CommentService extends FeedbackyService {

  PaginableRequest<List<FetchCommentDto>> getAllForIdea(long ideaId, int page, int pageSize);

  FetchCommentDto getOne(long id);

  ResponseEntity<FetchCommentDto> post(PostCommentDto dto);

  FetchUserDto postLike(long id);

  FetchCommentDto patch(long id, PatchCommentDto dto);

  ResponseEntity delete(long id);

  ResponseEntity deleteLike(long id);

}
