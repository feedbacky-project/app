package net.feedbacky.app.util;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * @author Plajer
 * <p>
 * Created at 16.11.2019
 */
@Data
@AllArgsConstructor
public class PaginableRequest<T> {

  private PageMetadata pageMetadata;
  private T data;

  @Data
  @AllArgsConstructor
  public static class PageMetadata {

    private int currentPage;
    private int pages;
    private int elementsPerPage;

  }

}
