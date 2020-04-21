package net.feedbacky.app.service.idea;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.data.idea.dto.attachment.PostAttachmentDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.FeedbackyService;
import net.feedbacky.app.util.PaginableRequest;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
public interface IdeaService extends FeedbackyService {

  PaginableRequest<List<FetchIdeaDto>> getAllIdeas(String discriminator, int page, int pageSize, FilterType filter, SortType sort);

  PaginableRequest<List<FetchIdeaDto>> getAllIdeasContaining(String discriminator, int page, int pageSize, String query);

  FetchIdeaDto getOne(long id);

  ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto);

  ResponseEntity<FetchAttachmentDto> postAttachment(long id, PostAttachmentDto dto);

  FetchIdeaDto patch(long id, PatchIdeaDto dto);

  ResponseEntity delete(long id);

  ResponseEntity deleteAttachment(long id);

  List<FetchUserDto> getAllVoters(long id);

  FetchUserDto postUpvote(long id);

  ResponseEntity deleteUpvote(long id);

  List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags);

  enum SortType {
    VOTERS_ASC, VOTERS_DESC, NEWEST, OLDEST, TRENDING
  }

  enum FilterType {
    OPENED, CLOSED, ALL
  }

}
