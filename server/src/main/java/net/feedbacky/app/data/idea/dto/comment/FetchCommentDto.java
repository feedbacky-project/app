package net.feedbacky.app.data.idea.dto.comment;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.idea.dto.comment.reaction.FetchCommentReactionDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
  private List<FetchCommentReactionDto> reactions;
  private boolean edited;
  private Long replyTo;
  private Date creationDate;

  private Map<String, String> metadata;

  @Override
  @CheckReturnValue
  public FetchCommentDto from(Comment entity) {
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getCreator());
    this.description = entity.getDescription();
    this.special = entity.isSpecial();
    this.specialType = entity.getSpecialType().name();
    this.viewType = entity.getViewType().name();
    this.reactions = entity.getReactions().stream().map(CommentReaction::toDto).collect(Collectors.toList());
    this.edited = entity.isEdited();
    if(entity.getReplyTo() != null) {
      this.replyTo = entity.getReplyTo().getId();
    }
    this.creationDate = entity.getCreationDate();

    this.metadata = new Gson().fromJson(entity.getMetadata(), Map.class);
    return this;
  }

  //strip any data for internal comments except replyTo for comment history purposes
  public FetchCommentDto asInternalInvisible() {
    this.user = null;
    this.description = null;
    this.reactions = new ArrayList<>();
    this.edited = false;
    this.creationDate = null;
    this.metadata = null;
    return this;
  }

}
