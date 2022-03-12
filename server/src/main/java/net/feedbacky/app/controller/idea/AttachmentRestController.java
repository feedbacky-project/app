package net.feedbacky.app.controller.idea;

import net.feedbacky.app.service.idea.attachment.AttachmentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@CrossOrigin
@RestController
public class AttachmentRestController {

  private final AttachmentService attachmentService;

  @Autowired
  public AttachmentRestController(AttachmentService attachmentService) {
    this.attachmentService = attachmentService;
  }

  @DeleteMapping("v1/attachments/{id}")
  public ResponseEntity deleteAttachment(@PathVariable long id) {
    return attachmentService.deleteAttachment(id);
  }

}
