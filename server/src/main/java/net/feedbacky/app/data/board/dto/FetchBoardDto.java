package net.feedbacky.app.data.board.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.dto.FetchTagDto;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2019
 */
@Getter
public class FetchBoardDto implements FetchResponseDto<FetchBoardDto, Board> {

  private long id;
  private String name;
  private String discriminator;
  private String shortDescription;
  private String fullDescription;
  private long creatorId;
  private boolean anonymousAllowed;
  private Date creationDate;

  private List<FetchSocialLinkDto> socialLinks;
  private List<FetchTagDto> tags;
  private List<FetchModeratorDto> moderators;
  private List<FetchSuspendedUserDto> suspendedUsers;

  private long allIdeas;
  private long openedIdeas;
  private long closedIdeas;

  private String themeColor;
  private String logo;
  private String banner;

  private String apiKey;

  private String ideasUrl = "/v1/boards/:id/ideas";
  private String webhooksUrl = "/v1/boards/:id/webhooks";
  private String invitedUsersUrl = "/v1/boards/:id/invitedUsers";
  private String invitationsUrl = "/v1/boards/:id/invitations";
  private String roadmapUrl = "/v1/boards/:id/roadmap";

  @Override
  public FetchBoardDto from(Board entity) {
    this.id = entity.getId();
    this.name = entity.getName();
    this.discriminator = entity.getDiscriminator();
    this.shortDescription = entity.getShortDescription();
    this.fullDescription = entity.getFullDescription();
    this.creatorId = entity.getCreator().getId();
    this.anonymousAllowed = entity.isAnonymousAllowed();
    this.creationDate = entity.getCreationDate();
    this.socialLinks = entity.getSocialLinks().stream().map(link -> new FetchSocialLinkDto().from(link)).collect(Collectors.toList());
    this.tags = entity.getTags().stream().map(tag -> new FetchTagDto().from(tag)).collect(Collectors.toList());
    this.moderators = entity.getModerators().stream().map(mod -> new FetchModeratorDto().from(mod)).collect(Collectors.toList());
    this.suspendedUsers = entity.getSuspensedList().stream().map(suspended -> new FetchSuspendedUserDto().from(suspended)).collect(Collectors.toList());
    this.allIdeas = entity.getIdeas().size();
    this.openedIdeas = entity.getIdeas().stream().filter(idea -> idea.getStatus() == Idea.IdeaStatus.OPENED).count();
    this.closedIdeas = entity.getIdeas().stream().filter(idea -> idea.getStatus() == Idea.IdeaStatus.CLOSED).count();
    this.themeColor = entity.getThemeColor();
    this.logo = entity.getLogo();
    this.banner = entity.getBanner();
    this.apiKey = "";
    return this;
  }

  public FetchBoardDto withConfidentialData(Board entity, boolean apply) {
    if(apply) {
      this.apiKey = entity.getApiKey();
    }
    return this;
  }

}
