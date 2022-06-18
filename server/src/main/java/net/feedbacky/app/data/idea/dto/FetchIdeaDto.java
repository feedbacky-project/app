package net.feedbacky.app.data.idea.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.google.errorprone.annotations.CheckReturnValue;
import com.google.gson.Gson;

import java.util.Date;
import java.util.List;
import java.util.Map;
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
  private List<FetchSimpleUserDto> assignees;
  private long votersAmount;
  private long commentsAmount;
  private boolean upvoted;
  private boolean subscribed;
  private boolean open;
  private boolean edited;
  private boolean commentingRestricted;
  private boolean pinned;
  private Date creationDate;

  private Map<String, String> metadata;

  private String votersUrl = "/v1/ideas/:id/voters";
  private String commentsUrl = "/v1/ideas/:id/comments";

  @Override
  @CheckReturnValue
  public FetchIdeaDto from(Idea entity) {
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.boardDiscriminator = entity.getBoard().getDiscriminator();
    this.title = entity.getTitle();
    this.description = entity.getDescription();
    this.user = new FetchSimpleUserDto().from(entity.getCreator());
    this.tags = entity.getTags().stream().map(Tag::toDto).collect(Collectors.toSet());
    this.attachments = entity.getAttachments().stream().map(Attachment::toDto).collect(Collectors.toList());
    this.assignees = entity.getAssignedModerators().stream().map(u -> new FetchSimpleUserDto().from(u)).collect(Collectors.toList());
    this.votersAmount = entity.getVoters().size();
    this.commentsAmount = entity.getComments().stream().filter(comment -> !comment.isSpecial()).filter(comment -> comment.getViewType() == Comment.ViewType.PUBLIC).count();
    this.upvoted = false;
    this.subscribed = false;
    this.open = entity.getStatus() == Idea.IdeaStatus.OPENED;
    this.edited = entity.isEdited();
    this.commentingRestricted = entity.isCommentingRestricted();
    this.pinned = entity.isPinned();
    this.creationDate = entity.getCreationDate();

    this.metadata = new Gson().fromJson(entity.getMetadata(), Map.class);
    return this;
  }

  public FetchIdeaDto withUser(Idea entity, User user) {
    if(entity == null) {
      return null;
    }
    this.upvoted = entity.getVoters().contains(user);
    this.subscribed = entity.getSubscribers().contains(user);
    return this;
  }

}
