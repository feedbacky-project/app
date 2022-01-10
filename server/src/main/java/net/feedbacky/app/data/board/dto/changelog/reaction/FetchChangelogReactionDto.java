package net.feedbacky.app.data.board.dto.changelog.reaction;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2022
 */
@Getter
public class FetchChangelogReactionDto implements FetchResponseDto<FetchChangelogReactionDto, ChangelogReaction> {

  private long id;
  private FetchSimpleUserDto user;
  private String reactionId;

  @Override
  @CheckReturnValue
  public FetchChangelogReactionDto from(ChangelogReaction entity) {
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.reactionId = entity.getReactionId();
    return this;
  }

}
