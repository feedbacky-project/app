package net.feedbacky.app.data.roadmap;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.util.PaginableRequest;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchRoadmapElement {

  private FetchTagDto tag;
  private PaginableRequest<List<FetchIdeaDto>> ideas;

}
