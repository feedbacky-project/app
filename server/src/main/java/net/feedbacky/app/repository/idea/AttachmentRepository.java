package net.feedbacky.app.repository.idea;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Repository @Table
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

  List<Attachment> findByIdea(Idea idea);

}
