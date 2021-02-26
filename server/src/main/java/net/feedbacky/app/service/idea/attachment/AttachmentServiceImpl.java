package net.feedbacky.app.service.idea.attachment;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;
import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;
import net.feedbacky.app.data.idea.dto.attachment.PostAttachmentDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.AttachmentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.objectstorage.ObjectStorage;
import net.feedbacky.app.util.request.ServiceValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@Service
public class AttachmentServiceImpl implements AttachmentService {

  private final IdeaRepository ideaRepository;
  private final AttachmentRepository attachmentRepository;
  private final UserRepository userRepository;
  private final ObjectStorage objectStorage;

  @Autowired
  public AttachmentServiceImpl(IdeaRepository ideaRepository, AttachmentRepository attachmentRepository, UserRepository userRepository, ObjectStorage objectStorage) {
    this.ideaRepository = ideaRepository;
    this.attachmentRepository = attachmentRepository;
    this.userRepository = userRepository;
    this.objectStorage = objectStorage;
  }

  @Override
  public ResponseEntity<FetchAttachmentDto> postAttachment(long id, PostAttachmentDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Idea idea = ideaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(!idea.getCreator().getId().equals(user.getId())) {
      throw new InsufficientPermissionsException();
    }
    if(idea.getAttachments().size() >= 3) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You can upload maximum of 3 attachments.");
    }
    Attachment attachment = new Attachment();
    attachment.setIdea(idea);
    attachment.setUrl(objectStorage.storeImage(Base64Util.extractBase64Data(dto.getData()), ObjectStorage.ImageType.ATTACHMENT));
    attachment = attachmentRepository.save(attachment);
    idea.getAttachments().add(attachment);
    ideaRepository.save(idea);
    return ResponseEntity.status(HttpStatus.CREATED).body(new FetchAttachmentDto().from(attachment));
  }
  @Override
  public ResponseEntity deleteAttachment(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Attachment attachment = attachmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Attachment with id {0} not found.", id)));
    Idea idea = attachment.getIdea();
    if(!idea.getCreator().equals(user) && !ServiceValidator.hasPermission(idea.getBoard(), Moderator.Role.MODERATOR, user)) {
      throw new InsufficientPermissionsException();
    }
    objectStorage.deleteImage(attachment.getUrl());
    idea.getAttachments().remove(attachment);
    attachmentRepository.delete(attachment);
    return ResponseEntity.noContent().build();
  }

}
