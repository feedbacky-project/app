package net.feedbacky.app.service.board;

import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.PatchBoardDto;
import net.feedbacky.app.data.board.dto.PostBoardDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagDto;
import net.feedbacky.app.data.tag.dto.PostTagDto;
import net.feedbacky.app.util.PaginableRequest;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
public interface BoardService {

  PaginableRequest<List<FetchBoardDto>> getAll(int page, int pageSize);

  FetchBoardDto getOne(String discriminator);

  ResponseEntity<FetchBoardDto> post(PostBoardDto dto);

  FetchBoardDto patch(String discriminator, PatchBoardDto dto);

  ResponseEntity delete(String discriminator);

  List<FetchTagDto> getAllTags(String discriminator);

  FetchTagDto getTagByName(String discriminator, String name);

  ResponseEntity<FetchTagDto> postTag(String discriminator, PostTagDto dto);

  FetchTagDto patchTag(String discriminator, String name, PatchTagDto dto);

  ResponseEntity deleteTag(String discriminator, String name);

}
