package net.feedbacky.app.data.idea.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
public class FetchIdeaDto implements FetchResponseDto<FetchIdeaDto, Idea> {

  private long id;
  private String boardDiscriminator;
  private String title;
  private String description;
  private FetchSimpleUserDto user;
  private Set<FetchTagDto> tags;
  private List<FetchAttachmentDto> attachments;
  private long votersAmount;
  private long commentsAmount;
  private boolean upvoted;
  private boolean subscribed;
  private boolean open;
  private boolean edited;
  private boolean commentingRestricted;
  private Date creationDate;

  private String votersUrl = "/v1/ideas/:id/voters";
  private String commentsUrl = "/v1/ideas/:id/comments";

  @Override
  @CheckReturnValue
  public FetchIdeaDto from(Idea entity) {
    this.id = entity.getId();
    this.boardDiscriminator = entity.getBoard().getDiscriminator();
    this.title = entity.getTitle();
    this.description = entity.getDescription();
    this.user = new FetchSimpleUserDto().from(entity.getCreator());
    this.tags = entity.getTags().stream().map(tag -> new FetchTagDto().from(tag)).collect(Collectors.toSet());
    this.attachments = entity.getAttachments().stream().map(attachment -> new FetchAttachmentDto().from(attachment)).collect(Collectors.toList());
    this.votersAmount = entity.getVoters().size();
    this.commentsAmount = entity.getComments().stream().filter(comment -> !comment.isSpecial()).filter(comment -> comment.getViewType() == Comment.ViewType.PUBLIC).count();
    this.upvoted = false;
    this.subscribed = false;
    this.open = entity.getStatus() == Idea.IdeaStatus.OPENED;
    this.edited = entity.isEdited();
    this.commentingRestricted = entity.isCommentingRestricted();
    this.creationDate = entity.getCreationDate();
    return this;
  }

  public FetchIdeaDto withUser(Idea entity, User user) {
    this.upvoted = entity.getVoters().contains(user);
    this.subscribed = entity.getSubscribers().contains(user);
    return this;
  }

}
