package net.feedbacky.app.rest.data.board.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import net.feedbacky.app.rest.data.board.dto.social.FetchSocialLinkDto;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchBoardDto {

  private long id;
  private String name;
  private String discriminator;
  private String shortDescription;
  private String fullDescription;
  private long creatorId;
  private Date creationDate;

  private List<FetchSocialLinkDto> socialLinks;

  private String themeColor;
  private String logo;
  private String banner;
  private boolean privatePage;

  private final String ideasUrl = "/v1/boards/:id/ideas";
  private final String moderatorsUrl = "/v1/boards/:id/moderators";
  private final String tagsUrl = "/v1/boards/:id/tags";
  private final String webhooksUrl = "/v1/boards/:id/webhooks";
  private final String invitedUsersUrl = "/v1/boards/:id/invitedUsers";
  private final String invitationsUrl = "/v1/boards/:id/invitations";

}
