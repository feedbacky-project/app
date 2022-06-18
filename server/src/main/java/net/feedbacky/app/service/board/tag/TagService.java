package net.feedbacky.app.service.board.tag;

import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagDto;
import net.feedbacky.app.data.tag.dto.PostTagDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
public interface TagService {

  List<FetchTagDto> getAllTags(String discriminator);

  FetchTagDto getTagById(String discriminator, long id);

  ResponseEntity<FetchTagDto> postTag(String discriminator, PostTagDto dto);

  FetchTagDto patchTag(String discriminator, long id, PatchTagDto dto);

  ResponseEntity deleteTag(String discriminator, long id);

}
