package net.feedbacky.app.data.board.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.integration.FetchIntegrationDto;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.suspended.FetchSuspendedUserDto;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.social.SocialLink;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;
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
  private boolean roadmapEnabled;
  private boolean changelogEnabled;
  private boolean closedIdeasCommentingEnabled;
  private Date creationDate;
  private Date lastChangelogUpdate;

  private List<FetchSocialLinkDto> socialLinks;
  private List<FetchTagDto> tags;
  private List<FetchModeratorDto> moderators;
  private List<FetchSuspendedUserDto> suspendedUsers;
  private List<FetchIntegrationDto> integrations;

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
    if(entity == null) {
      return null;
    }
    this.id = entity.getId();
    this.name = entity.getName();
    this.discriminator = entity.getDiscriminator();
    this.shortDescription = entity.getShortDescription();
    this.fullDescription = entity.getFullDescription();
    this.creatorId = entity.getCreator().getId();
    this.anonymousAllowed = entity.isAnonymousAllowed();
    this.roadmapEnabled = entity.isRoadmapEnabled();
    this.changelogEnabled = entity.isChangelogEnabled();
    this.closedIdeasCommentingEnabled = entity.isClosedIdeasCommentingEnabled();
    this.creationDate = entity.getCreationDate();
    this.lastChangelogUpdate = entity.getLastChangelogUpdate();
    this.socialLinks = entity.getSocialLinks().stream().map(SocialLink::toDto).collect(Collectors.toList());
    this.tags = entity.getTags().stream().map(Tag::toDto).collect(Collectors.toList());
    this.moderators = entity.getModerators().stream().map(Moderator::toDto).collect(Collectors.toList());
    this.suspendedUsers = entity.getSuspensedList().stream().map(SuspendedUser::toDto).collect(Collectors.toList());
    this.integrations = entity.getIntegrations().stream().map(Integration::toDto).collect(Collectors.toList());
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
      this.integrations = entity.getIntegrations().stream().map(i -> i.toDto().withConfidentialData(i, true)).collect(Collectors.toList());
    }
    return this;
  }

}
