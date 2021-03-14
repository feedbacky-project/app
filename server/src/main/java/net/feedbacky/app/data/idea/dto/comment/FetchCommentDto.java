package net.feedbacky.app.data.idea.dto.comment;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;

import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Getter
public class FetchCommentDto implements FetchResponseDto<FetchCommentDto, Comment> {

  private long id;
  private FetchSimpleUserDto user;
  private String description;
  private boolean special;
  private String specialType;
  private String viewType;
  private int likesAmount;
  private boolean liked;
  private boolean edited;
  private Date creationDate;

  @Override
  @CheckReturnValue
  public FetchCommentDto from(Comment entity) {
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getCreator());
    this.description = entity.getDescription();
    this.special = entity.isSpecial();
    this.specialType = entity.getSpecialType().name();
    this.viewType = entity.getViewType().name();
    this.likesAmount = entity.getLikers().size();
    this.liked = false;
    this.edited = entity.isEdited();
    this.creationDate = entity.getCreationDate();
    return this;
  }

  public FetchCommentDto withUser(Comment entity, User user) {
    this.liked = entity.getLikers().contains(user);
    return this;
  }

}
