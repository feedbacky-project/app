package net.feedbacky.app.data.board.dto.changelog;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.dto.changelog.reaction.FetchChangelogReactionDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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
  private FetchSimpleUserDto creator;
  private List<FetchChangelogReactionDto> reactions;
  private Date creationDate;

  @Override
  public FetchChangelogDto from(Changelog entity) {
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.title = entity.getTitle();
    this.description = entity.getDescription();
    this.edited = entity.isEdited();
    this.creator = new FetchSimpleUserDto().from(entity.getCreator());
    this.reactions = entity.getReactions().stream().map(ChangelogReaction::toDto).collect(Collectors.toList());
    this.creationDate = entity.getCreationDate();
    return this;
  }

}
