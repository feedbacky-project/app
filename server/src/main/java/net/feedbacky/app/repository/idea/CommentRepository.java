package net.feedbacky.app.repository.idea;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphJpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@Repository
@Table
public interface CommentRepository extends EntityGraphJpaRepository<Comment, Long> {

  @EntityGraph(value = "Comment.fetch")
  Page<Comment> findByIdea(Idea idea, Pageable pageable);

  @EntityGraph(value = "Comment.fetch")
  Optional<Comment> findByCreatorAndDescriptionAndIdea(User creator, String description, Idea idea);

}
