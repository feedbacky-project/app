package net.feedbacky.app.service.idea;

import lombok.Getter;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchVotersDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.util.PaginableRequest;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
public interface IdeaService {

  PaginableRequest<List<FetchIdeaDto>> getAllIdeasByFilterQuery(String discriminator, int page, int pageSize, String filterQuery, SortType sort, String anonymousId);

  FetchIdeaDto getOne(long id, String anonymousId);

  ResponseEntity<FetchIdeaDto> post(PostIdeaDto dto);

  FetchIdeaDto patch(long id, PatchIdeaDto dto);

  ResponseEntity delete(long id);

  List<FetchSimpleUserDto> getAllMentions(long id);

  List<FetchTagDto> patchTags(long id, List<PatchTagRequestDto> tags);

  @Getter
  enum SortType {
    VOTERS_ASC("i.votersAmount ASC"),
    VOTERS_DESC("i.votersAmount DESC"),
    NEWEST("i.creationDate DESC"),
    OLDEST("i.creationDate ASC"),
    TRENDING("i.trendScore DESC");

    private String orderSqlPart;

    SortType(String orderSqlPart) {
      this.orderSqlPart = orderSqlPart;
    }
  }

  class FilterType {

    public static final FilterType OPENED = new FilterType(Type.OPENED, null);
    private Type type;
    private Long value;

    public FilterType(Type type, Long value) {
      this.type = type;
      this.value = value;
    }

    public Type getType() {
      return type;
    }

    public Long getValue() {
      return value;
    }

    public enum Type {
      OPENED, CLOSED, ALL, TAG
    }
  }

}
