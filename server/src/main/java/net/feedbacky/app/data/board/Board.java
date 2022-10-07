package net.feedbacky.app.data.board;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.social.SocialLink;
import net.feedbacky.app.data.board.suspended.SuspendedUser;
import net.feedbacky.app.data.board.webhook.Webhook;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.mailservice.MailService;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.LazyToOne;
import org.hibernate.annotations.LazyToOneOption;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NamedEntityGraph(name = "Board.fetch", attributeNodes = {
        @NamedAttributeNode("creator"), @NamedAttributeNode("ideas"),
        @NamedAttributeNode(value = "moderators", subgraph = "Board.subgraph.moderatorsFetch"), @NamedAttributeNode("tags"),
        @NamedAttributeNode("socialLinks"), @NamedAttributeNode("suspensedList"),
        @NamedAttributeNode("webhooks"), @NamedAttributeNode("integrations")},
        subgraphs = {
                @NamedSubgraph(name = "Board.subgraph.moderatorsFetch", attributeNodes = {
                        @NamedAttributeNode("user")
                })
        })
public class Board implements Serializable, Fetchable<FetchBoardDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  private String name;
  private String discriminator;
  private String shortDescription;
  @Column(name = "full_description", columnDefinition = "text", length = 65_535)
  private String fullDescription;
  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private User creator;
  @CreationTimestamp
  private Date creationDate;
  private String themeColor;
  private String logo;
  private String banner;
  private String apiKey = "";
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Idea> ideas = new LinkedHashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board", orphanRemoval = true)
  private Set<Moderator> moderators = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Invitation> invitedModerators = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Tag> tags = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Webhook> webhooks = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Integration> integrations = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<SocialLink> socialLinks = new HashSet<>();
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<SuspendedUser> suspensedList = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "board")
  private Set<Changelog> changelogs = new HashSet<>();
  private boolean anonymousAllowed = true;
  private boolean roadmapEnabled = true;
  private boolean changelogEnabled = true;
  private boolean closedIdeasCommentingEnabled = false;
  private Date lastChangelogUpdate;

  @Override
  public FetchBoardDto toDto() {
    return new FetchBoardDto().from(this);
  }

  public String toViewLink() {
    return MailService.HOST_ADDRESS + "/b/" + discriminator;
  }

  public String toAdminPanelViewLink() {
    return MailService.HOST_ADDRESS + "/ba/" + discriminator;
  }

}
