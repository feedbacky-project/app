package net.feedbacky.app.service.board.changelog;

import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PostChangelogDto;
import net.feedbacky.app.util.PaginableRequest;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
public interface BoardChangelogService {

  PaginableRequest<List<FetchChangelogDto>> getAll(String discriminator, int page, int pageSize);

  ResponseEntity<FetchChangelogDto> post(String discriminator, PostChangelogDto dto);

  ResponseEntity delete(long id);

}
