package net.feedbacky.app.data.idea.dto.comment.reaction;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;

/**
 * @author Plajer
 * <p>
 * Created at 09.01.2022
 */
@Getter
public class FetchCommentReactionDto implements FetchResponseDto<FetchCommentReactionDto, CommentReaction> {

  private long id;
  private FetchSimpleUserDto user;
  private String reactionId;

  @Override
  @CheckReturnValue
  public FetchCommentReactionDto from(CommentReaction entity) {
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.reactionId = entity.getReactionId();
    return this;
  }

}
