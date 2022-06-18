package net.feedbacky.app.data.idea.comment;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.user.User;

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
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import java.io.Serializable;
import java.text.MessageFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Entity
@Table(name = "ideas_comments")
@Getter
@Setter
@NoArgsConstructor
@NamedEntityGraph(name = "Comment.fetch", attributeNodes = {@NamedAttributeNode("creator"), @NamedAttributeNode("reactions"), @NamedAttributeNode("replyTo")})
public class Comment implements Serializable, Fetchable<FetchCommentDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private Idea idea;
  @ManyToOne(fetch = FetchType.LAZY)
  private User creator;
  @Column(name = "description", columnDefinition = "text", length = 65_535)
  private String description;
  private boolean special;
  private SpecialType specialType;
  private boolean edited;
  private ViewType viewType = ViewType.PUBLIC;
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "comment", orphanRemoval = true)
  private Set<CommentReaction> reactions = new HashSet<>();
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "replyTo", referencedColumnName = "id")
  private Comment replyTo;
  @CreationTimestamp
  private Date creationDate;
  @Column(name = "metadata", columnDefinition = "varchar(2500) default '{}'")
  private String metadata;

  @Override
  public FetchCommentDto toDto() {
    return new FetchCommentDto().from(this);
  }

  public enum SpecialType {
    LEGACY(""),
    IDEA_CLOSED("{0} has closed the idea."), IDEA_OPENED("{0} has reopened the idea."),
    IDEA_EDITED("{0} has edited description of the idea."), TAGS_MANAGED("{0} has {1}"),
    COMMENTS_RESTRICTED("{0} has restricted commenting to moderators only."), COMMENTS_ALLOWED("{0} has removed commenting restrictions."),
    IDEA_PINNED("{0} has pinned the idea."), IDEA_UNPINNED("{0} has unpinned the idea."),
    IDEA_ASSIGNED("{0} has been assigned to this idea by {1}."), IDEA_VOTES_RESET("{0} has reset {1} votes."),
    IDEA_TITLE_CHANGE("{0} has edited title of the idea. {1}"), IDEA_UNASSIGNED("{0} unassigned {1} from this idea."),

    INTEGRATION_GITHUB_CONVERT("{0} has converted this idea to {1}");

    private final String text;

    SpecialType(String text) {
      this.text = text;
    }

    public String parsePlaceholders(String... placeholders) {
      return MessageFormat.format(text, (Object[]) placeholders);
    }
  }

  public enum CommentMetadata {
    POSTED_VIA("via"), INTEGRATION_GITHUB_COMMENT_ID("gh_comment_id");

    @Getter private String key;

    CommentMetadata(String key) {
      this.key = key;
    }
  }

  public enum ViewType {
    PUBLIC, INTERNAL, DELETED
  }

}
