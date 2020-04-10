package net.feedbacky.app.repository.idea;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

  Page<Comment> findByIdea(Idea idea, Pageable pageable);

  Optional<Comment> findByCreatorAndDescriptionAndIdea(User creator, String description, Idea idea);

}
