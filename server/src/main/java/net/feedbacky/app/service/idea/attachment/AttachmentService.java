package net.feedbacky.app.service.idea.attachment;

import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.data.idea.dto.attachment.PostAttachmentDto;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
public interface AttachmentService {

  ResponseEntity<FetchAttachmentDto> postAttachment(long id, PostAttachmentDto dto);

  ResponseEntity deleteAttachment(long id);

}
