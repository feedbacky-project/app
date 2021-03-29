package net.feedbacky.app.data.board.dto.changelog;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.changelog.Changelog;

import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Getter
public class FetchChangelogDto implements FetchResponseDto<FetchChangelogDto, Changelog> {

  private long id;
  private String title;
  private String description;
  private boolean edited;
  private Date creationDate;

  @Override
  public FetchChangelogDto from(Changelog entity) {
    this.id = entity.getId();
    this.title = entity.getTitle();
    this.description = entity.getDescription();
    this.edited = entity.isEdited();
    this.creationDate = entity.getCreationDate();
    return this;
  }

}
