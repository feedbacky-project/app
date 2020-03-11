package net.feedbacky.app.util;

import net.feedbacky.app.service.idea.IdeaService;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

/**
 * @author Plajer
 * <p>
 * Created at 05.01.2020
 */
class SortFilterResolverTest {

  @Test
  public void testResolveSorting() {
    Sort votersDesc = SortFilterResolver.resolveSorting(IdeaService.SortType.VOTERS_DESC);
    assertEquals(Sort.by(Sort.Direction.DESC, "votersAmount"), votersDesc);
    Sort votersAsc = SortFilterResolver.resolveSorting(IdeaService.SortType.VOTERS_ASC);
    assertEquals(Sort.by(Sort.Direction.ASC, "votersAmount"), votersAsc);

    Sort newest = SortFilterResolver.resolveSorting(IdeaService.SortType.NEWEST);
    assertEquals(Sort.by(Sort.Direction.DESC, "creationDate"), newest);
    Sort oldest = SortFilterResolver.resolveSorting(IdeaService.SortType.OLDEST);
    assertEquals(Sort.by(Sort.Direction.ASC, "creationDate"), oldest);
  }

}