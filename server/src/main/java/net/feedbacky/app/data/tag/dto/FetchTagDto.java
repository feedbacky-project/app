package net.feedbacky.app.data.tag.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.tag.Tag;

/**
 * @author Plajer
 * <p>
 * Created at 13.10.2019
 */
@Getter
public class FetchTagDto implements FetchResponseDto<FetchTagDto, Tag> {

  private long id;
  private String name;
  private String color;
  private boolean roadmapIgnored;
  private boolean publicUse;

  @Override
  public FetchTagDto from(Tag entity) {
    this.id = entity.getId();
    this.name = entity.getName();
    this.color = entity.getColor();
    this.roadmapIgnored = entity.isRoadmapIgnored();
    this.publicUse = entity.isPublicUse();
    return this;
  }
}
