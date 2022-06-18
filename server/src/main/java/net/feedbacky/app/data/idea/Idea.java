package net.feedbacky.app.data.idea;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.attachment.Attachment;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Entity
@Table(name = "ideas")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NamedEntityGraph(name = "Idea.fetch", attributeNodes = {
        @NamedAttributeNode(value = "creator"), @NamedAttributeNode("voters"),
        @NamedAttributeNode("comments"), @NamedAttributeNode("tags"), @NamedAttributeNode("assignedModerators"),
        @NamedAttributeNode("attachments"), @NamedAttributeNode("subscribers")
})
@NamedEntityGraph(name = "Idea.fetchMentions", attributeNodes = {
        @NamedAttributeNode(value = "creator", subgraph = "Idea.subgraph.creatorFetch"), @NamedAttributeNode(value = "comments", subgraph = "Idea.subgraph.commentsFetch"),
        @NamedAttributeNode(value = "board", subgraph = "Idea.subgraph.boardFetch")
},
        subgraphs = {
                @NamedSubgraph(name = "Idea.subgraph.commentsFetch", attributeNodes = {
                        @NamedAttributeNode("creator")
                }),
                @NamedSubgraph(name = "Idea.subgraph.boardFetch", attributeNodes = {
                        @NamedAttributeNode("moderators")
                })
        })
@NamedEntityGraph(name = "Idea.postUpvote", attributeNodes = {
        @NamedAttributeNode(value = "creator"), @NamedAttributeNode("voters"),
        @NamedAttributeNode("comments"), @NamedAttributeNode("subscribers"), @NamedAttributeNode(value = "board", subgraph = "Idea.subgraph.postBoardFetch")
}, subgraphs = {
        @NamedSubgraph(name = "Idea.subgraph.postBoardFetch", attributeNodes = {
                @NamedAttributeNode("suspensedList")
        })
})
@NamedEntityGraph(name = "Idea.patch", attributeNodes = {
        @NamedAttributeNode(value = "creator"), @NamedAttributeNode("voters"),
        @NamedAttributeNode("comments"), @NamedAttributeNode("tags"), @NamedAttributeNode("assignedModerators"),
        @NamedAttributeNode("attachments"), @NamedAttributeNode("subscribers"),
        @NamedAttributeNode(value = "board", subgraph = "Idea.subgraph.postBoardFetch")
}, subgraphs = {
        @NamedSubgraph(name = "Idea.subgraph.postBoardFetch", attributeNodes = {
                @NamedAttributeNode("webhooks"), @NamedAttributeNode("moderators")
        })
})
@NamedEntityGraph(name = "Idea.patchTags", attributeNodes = {
        @NamedAttributeNode(value = "creator"), @NamedAttributeNode("voters"),
        @NamedAttributeNode("comments"), @NamedAttributeNode("tags"), @NamedAttributeNode("assignedModerators"),
        @NamedAttributeNode("attachments"), @NamedAttributeNode("subscribers"),
        @NamedAttributeNode(value = "board", subgraph = "Idea.subgraph.postBoardFetch")
}, subgraphs = {
        @NamedSubgraph(name = "Idea.subgraph.postBoardFetch", attributeNodes = {
                @NamedAttributeNode("webhooks"), @NamedAttributeNode("moderators"), @NamedAttributeNode("tags")
        })
})
public class Idea implements Serializable, Fetchable<FetchIdeaDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private Board board;
  private String title;
  @Column(name = "description", columnDefinition = "text", length = 65_535)
  private String description;
  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private User creator;
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<User> voters = new HashSet<>();
  //always the same as voters.size()
  private int votersAmount;
  private double trendScore;
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "idea")
  private Set<Comment> comments = new HashSet<>();
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<Tag> tags = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "idea")
  private Set<Attachment> attachments = new HashSet<>();
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<User> subscribers = new HashSet<>();
  private IdeaStatus status;
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<User> assignedModerators = new HashSet<>();
  @CreationTimestamp
  private Date creationDate;
  private boolean edited = false;
  private boolean commentingRestricted = false;
  private boolean pinned = false;
  @Column(name = "metadata", columnDefinition = "varchar(2500) default '{}'")
  private String metadata;

  public void setVoters(Set<User> voters) {
    this.voters = voters;
    this.votersAmount = voters.size();
    recalculateTrendScore();
  }

  public void setSubscribers(Set<User> subscribers) {
    this.subscribers = subscribers;
    recalculateTrendScore();
  }

  public void setComments(Set<Comment> comments) {
    this.comments = comments;
    recalculateTrendScore();
  }

  public void recalculateTrendScore() {
    this.trendScore = getCalculatedTrendScore();
  }

  public double getCalculatedTrendScore() {
    /*
    voters (upvotes) count as * 1
    (subscribers - 1) as * 0.75 (minus one to exclude idea creator)
    comments as * 0.5
    */
    double value = Math.abs((double) voters.size()
            + Math.abs(((double) subscribers.size() - 1) * 0.75)
            + ((double) comments.stream().filter(comment -> !comment.isSpecial()).filter(comment -> comment.getViewType() == Comment.ViewType.PUBLIC).count() * 0.5));
    double gravity = Math.pow(ChronoUnit.DAYS.between(creationDate.toInstant(), Instant.now()) + 2.0, 1.8);
    return value / gravity;
  }

  @Override
  public FetchIdeaDto toDto() {
    return new FetchIdeaDto().from(this);
  }

  public String toViewLink() {
    String slug = title;
    slug = slug.toLowerCase();
    slug = slug.replaceAll("[\\W_]", "-")
            .replaceAll("(\\W)\\1+", "-")
            .replaceAll("^(-)", "")
            .replaceAll("(-)$", "");
    return MailService.HOST_ADDRESS + "/i/" + slug + "." + id;
  }

  public enum IdeaMetadata {
    INTEGRATION_GITHUB_ISSUE_ID("integration_github_issue_id"), INTEGRATION_GITHUB_ISSUE_NUMBER("integration_github_issue_number"),
    INTEGRATION_GITHUB_URL("integration_github_url");

    @Getter private String key;

    IdeaMetadata(String key) {
      this.key = key;
    }
  }

  public enum IdeaStatus {
    OPENED(true), CLOSED(false);

    private final boolean value;

    IdeaStatus(boolean value) {
      this.value = value;
    }

    public static IdeaStatus toIdeaStatus(boolean state) {
      if(state) {
        return OPENED;
      }
      return CLOSED;
    }

    public boolean getValue() {
      return value;
    }

  }

}
