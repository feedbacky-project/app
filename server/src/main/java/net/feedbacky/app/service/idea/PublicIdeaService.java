package net.feedbacky.app.service.idea;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.PublicApiRequest;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
public interface PublicIdeaService {

  PublicApiRequest<PaginableRequest<List<FetchIdeaDto>>> getAllIdeas(String discriminator, int page, int pageSize, IdeaService.FilterType filter, IdeaService.SortType sort);

  PublicApiRequest<FetchIdeaDto> getOne(long id);

  ResponseEntity<PublicApiRequest<FetchIdeaDto>> post(PostIdeaDto dto);

  PublicApiRequest<FetchUserDto> postUpvote(long id);

  ResponseEntity<PublicApiRequest<?>> deleteUpvote(long id);

}