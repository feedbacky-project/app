package net.feedbacky.app.data.board;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.social.SocialLink;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.board.webhook.WebhookExecutor;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.user.User;

import org.hibernate.annotations.CreationTimestamp;
import org.modelmapper.ModelMapper;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Entity
@Table(name = "boards")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Board implements Serializable {

  @Transient private final transient WebhookExecutor webhookExecutor = new WebhookExecutor(this);
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String discriminator;
  private String shortDescription;
  @Column(name = "full_description", columnDefinition = "text", length = 65_535)
  private String fullDescription;
  @ManyToOne
  private User creator;
  @CreationTimestamp
  private Date creationDate;
  private String themeColor;
  private String logo;
  private String banner;
  private boolean privatePage;
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Idea> ideas = new LinkedHashSet<>();
  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "board", orphanRemoval = true)
  private Set<Moderator> moderators = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Invitation> invitedModerators = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Tag> tags = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Webhook> webhooks = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY)
  private Set<User> invitedUsers = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Invitation> invitations = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<SocialLink> socialLinks = new HashSet<>();

  public boolean canView(User user) {
    if(privatePage) {
      if(user == null) {
        return false;
      }
      return user.isServiceStaff() || getInvitedUsers().contains(user) || getModerators().stream().anyMatch(mod -> mod.getUser().equals(user));
    }
    return true;
  }

  public FetchProjectRequest convertToDto() {
    return new FetchProjectRequest(this);
  }

  public static class FetchProjectRequest {

    private Board preDto;

    public FetchProjectRequest(Board preDto) {
      this.preDto = preDto;
    }

    public FetchBoardDto ensureViewPermission(User user) {
      if(preDto.canView(user)) {
        FetchBoardDto dto = new ModelMapper().map(preDto, FetchBoardDto.class);
        dto.setSocialLinks(preDto.getSocialLinks().stream().map(SocialLink::convertToDto).collect(Collectors.toList()));
        dto.setModerators(preDto.getModerators().stream().map(Moderator::convertToModeratorDto).collect(Collectors.toList()));
        return dto;
      }
      FetchBoardDto dto = new FetchBoardDto();
      dto.setId(preDto.getId());
      dto.setDiscriminator(preDto.getDiscriminator());
      dto.setPrivatePage(true);
      return dto;
    }

    public FetchBoardDto ensureViewExplicit() {
      return new ModelMapper().map(preDto, FetchBoardDto.class);
    }
  }

}
