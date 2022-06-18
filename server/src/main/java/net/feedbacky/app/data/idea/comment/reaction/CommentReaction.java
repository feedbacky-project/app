package net.feedbacky.app.data.idea.comment.reaction;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.comment.reaction.FetchCommentReactionDto;
import net.feedbacky.app.data.user.User;

import org.hibernate.annotations.LazyToOne;
import org.hibernate.annotations.LazyToOneOption;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 09.01.2022
 */
@Entity
@Table(name = "ideas_comment_reactions")
@Getter
@Setter
@NoArgsConstructor
public class CommentReaction implements Serializable, Fetchable<FetchCommentReactionDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private Comment comment;
  @ManyToOne(fetch = FetchType.LAZY)
  private User user;
  private String reactionId;

  @Override
  public FetchCommentReactionDto toDto() {
    return new FetchCommentReactionDto().from(this);
  }
}
