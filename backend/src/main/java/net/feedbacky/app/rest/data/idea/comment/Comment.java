package net.feedbacky.app.rest.data.idea.comment;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import net.feedbacky.app.rest.data.idea.Idea;
import net.feedbacky.app.rest.data.idea.dto.comment.FetchCommentDto;

import org.hibernate.annotations.CreationTimestamp;
import org.modelmapper.ModelMapper;

import net.feedbacky.app.rest.data.user.User;

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
    LEGACY((byte) 0), IDEA_CLOSED((byte) 1), IDEA_OPENED((byte) 2), IDEA_EDITED((byte) 2), TAGS_MANAGED((byte) 3);

    private byte id;

    SpecialType(byte id) {
      this.id = id;
    }

    public byte getId() {
      return id;
    }
  }

}
