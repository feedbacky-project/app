package net.feedbacky.app.repository.idea;

import java.util.List;

import net.feedbacky.app.rest.data.idea.Idea;
import net.feedbacky.app.rest.data.idea.attachment.Attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

  List<Attachment> findByIdea(Idea idea);

}
