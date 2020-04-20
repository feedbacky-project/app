package net.feedbacky.app.data.idea.comment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.dto.comment.FetchCommentDto;
import net.feedbacky.app.data.user.User;

import org.hibernate.annotations.CreationTimestamp;
import org.modelmapper.ModelMapper;

import javax.persistence.Column;
import javax.persistence.Converter;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;
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
@AllArgsConstructor
@NoArgsConstructor
public class Comment implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private Idea idea;
  @ManyToOne(fetch = FetchType.LAZY)
  private User creator;
  @Column(name = "description", columnDefinition = "text", length = 65_535)
  private String description;
  private boolean special;
  private SpecialType specialType;
  @Enumerated(EnumType.STRING)
  @Column(name = "view_type", columnDefinition = "enum")
  private ViewType viewType = ViewType.PUBLIC;
  @ManyToMany(fetch = FetchType.LAZY)
  private Set<User> likers = new HashSet<>();
  @CreationTimestamp
  private Date creationDate;

  public FetchCommentDto convertToDto(User user) {
    FetchCommentDto dto = new ModelMapper().map(this, FetchCommentDto.class);
    dto.setLiked(likers.contains(user));
    dto.setLikesAmount(likers.size());
    dto.setUser(creator.convertToDto().exposeSensitiveData(false).convertToSimpleDto());
    return dto;
  }

  //byte type to force database to use smaller data type
  public enum SpecialType {
    LEGACY, IDEA_CLOSED, IDEA_OPENED, IDEA_EDITED, TAGS_MANAGED
  }

  public enum ViewType {
    PUBLIC, INTERNAL
  }

}
