package net.feedbacky.app.data.board.dto.integration;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;

import org.kohsuke.github.GHIssue;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Getter
public class FetchGithubIssue implements FetchResponseDto<FetchGithubIssue, GHIssue> {

  private long id;
  private String title;
  private String url;

  @Override
  public FetchGithubIssue from(GHIssue entity) {
    this.id = entity.getId();
    this.title = entity.getTitle();
    this.url = entity.getUrl().toString();
    return this;
  }
}
