package net.feedbacky.app.repository.idea;

import java.util.Optional;

import net.feedbacky.app.rest.data.idea.Idea;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.feedbacky.app.rest.data.idea.comment.Comment;
import net.feedbacky.app.rest.data.user.User;

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
