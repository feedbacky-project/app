package net.feedbacky.app.util;

import net.feedbacky.app.service.comment.CommentService;
import net.feedbacky.app.service.idea.IdeaService;

import org.springframework.data.domain.Sort;

/**
 * @author Plajer
 * <p>
 * Created at 19.11.2019
 */
public class SortFilterResolver {

  private SortFilterResolver() {
  }

  public static Sort resolveCommentsSorting(CommentService.SortType sortType) {
    switch(sortType) {
      case NEWEST:
        return Sort.by(Sort.Direction.DESC, "creationDate");
      case OLDEST:
      default:
        return Sort.by(Sort.Direction.ASC, "creationDate");
    }
  }

  public static Sort resolveIdeaSorting(IdeaService.SortType sortType) {
    switch(sortType) {
      case NEWEST:
        return Sort.by(Sort.Direction.DESC, "creationDate");
      case OLDEST:
        return Sort.by(Sort.Direction.ASC, "creationDate");
      case VOTERS_ASC:
        return Sort.by(Sort.Direction.ASC, "votersAmount");
      case VOTERS_DESC:
        return Sort.by(Sort.Direction.DESC, "votersAmount");
      case TRENDING:
      default:
        return Sort.by(Sort.Direction.DESC, "trendScore");
    }
  }

}
