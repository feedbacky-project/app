package net.feedbacky.app.rest.data.idea.dto;

import java.util.Date;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import net.feedbacky.app.rest.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.rest.data.tag.dto.FetchTagDto;
import net.feedbacky.app.rest.data.user.dto.FetchSimpleUserDto;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchIdeaDto {

  private final String votersUrl = "/v1/ideas/:id/voters";
  private final String commentsUrl = "/v1/ideas/:id/comments";
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
  private boolean open;
  private boolean edited;

  private Date creationDate;

}
