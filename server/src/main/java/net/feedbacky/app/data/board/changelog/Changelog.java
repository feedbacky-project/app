package net.feedbacky.app.data.board.changelog;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.reaction.ChangelogReaction;
import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
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
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Entity
@Table(name = "boards_changelogs")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NamedEntityGraph(name = "Changelog.fetch", attributeNodes = {
        @NamedAttributeNode("creator"), @NamedAttributeNode(value = "reactions", subgraph = "Changelog.subgraph.reactionsFetch")},
        subgraphs = {
                @NamedSubgraph(name = "Changelog.subgraph.reactionsFetch", attributeNodes = {
                        @NamedAttributeNode("user")
                })
        })
public class Changelog implements Serializable, Fetchable<FetchChangelogDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id")
  private Board board;
  private String title;
  @Column(name = "description", columnDefinition = "text", length = 65_535)
  private String description;
  private boolean edited;
  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  @JoinColumn(name = "user_id")
  private User creator;
  @CreationTimestamp
  private Date creationDate;
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "changelog", orphanRemoval = true)
  private Set<ChangelogReaction> reactions = new HashSet<>();

  public String toViewLink() {
    return board.toViewLink() + "/changelog?changelogId=" + id;
  }

  @Override
  public FetchChangelogDto toDto() {
    return new FetchChangelogDto().from(this);
  }
}
