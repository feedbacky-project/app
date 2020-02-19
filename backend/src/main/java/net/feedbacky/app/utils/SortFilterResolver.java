package net.feedbacky.app.utils;

import net.feedbacky.app.service.idea.IdeaService;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * @author Plajer
 * <p>
 * Created at 19.11.2019
 */
@Component
public class SortFilterResolver {

  public Sort resolveSorting(IdeaService.SortType sortType) {
    switch(sortType) {
      case NEWEST:
        return Sort.by(Sort.Direction.DESC, "creationDate");
      case OLDEST:
        return Sort.by(Sort.Direction.ASC, "creationDate");
      case VOTERS_ASC:
        return Sort.by(Sort.Direction.ASC, "votersAmount");
      case VOTERS_DESC:
      default:
        return Sort.by(Sort.Direction.DESC, "votersAmount");
    }
  }

}
