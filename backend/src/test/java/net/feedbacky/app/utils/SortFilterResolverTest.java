package net.feedbacky.app.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;

import net.feedbacky.app.service.idea.IdeaService;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

/**
 * @author Plajer
 * <p>
 * Created at 05.01.2020
 */
class SortFilterResolverTest {

  private SortFilterResolver filterResolver = new SortFilterResolver();

  @Test
  public void testResolveSorting() {
    Sort votersDesc = filterResolver.resolveSorting(IdeaService.SortType.VOTERS_DESC);
    assertEquals(Sort.by(Sort.Direction.DESC, "votersAmount"), votersDesc);
    Sort votersAsc = filterResolver.resolveSorting(IdeaService.SortType.VOTERS_ASC);
    assertEquals(Sort.by(Sort.Direction.ASC, "votersAmount"), votersAsc);

    Sort newest = filterResolver.resolveSorting(IdeaService.SortType.NEWEST);
    assertEquals(Sort.by(Sort.Direction.DESC, "creationDate"), newest);
    Sort oldest = filterResolver.resolveSorting(IdeaService.SortType.OLDEST);
    assertEquals(Sort.by(Sort.Direction.ASC, "creationDate"), oldest);
  }

}