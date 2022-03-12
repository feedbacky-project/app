package net.feedbacky.app.service.board.tag;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagDto;
import net.feedbacky.app.data.tag.dto.PostTagDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
@Service
public class TagServiceImpl implements TagService {

  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final IdeaRepository ideaRepository;
  private final TagRepository tagRepository;

  @Autowired
  public TagServiceImpl(BoardRepository boardRepository, UserRepository userRepository, IdeaRepository ideaRepository, TagRepository tagRepository) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.ideaRepository = ideaRepository;
    this.tagRepository = tagRepository;
  }

  @Override
  public List<FetchTagDto> getAllTags(String discriminator) {
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphUtils.fromAttributePaths("tags"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    return board.getTags().stream().map(Tag::toDto).collect(Collectors.toList());
  }

  @Override
  public FetchTagDto getTagById(String discriminator, long id) {
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    Tag tag = tagRepository.findByBoardAndId(board, id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Tag with id {0} not found.", id)));
    return tag.toDto();
  }

  @Override
  public ResponseEntity<FetchTagDto> postTag(String discriminator, PostTagDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    if(tagRepository.findByBoardAndName(board, dto.getName()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Tag with this name already exists.");
    }
    Tag tag = dto.convertToEntity(board);
    tag = tagRepository.save(tag);
    return ResponseEntity.status(HttpStatus.CREATED).body(tag.toDto());
  }

  @Override
  public FetchTagDto patchTag(String discriminator, long id, PatchTagDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    Tag tag = tagRepository.findByBoardAndId(board, id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Tag with id {0} not found.", id)));

    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, tag);

    tag = tagRepository.save(tag);
    return tag.toDto();
  }

  @Override
  public ResponseEntity deleteTag(String discriminator, long id) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);
    Tag tag = tagRepository.findByBoardAndId(board, id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Tag with id {0} not found.", id)));
    board.getIdeas().forEach(idea -> {
      idea.getTags().remove(tag);
      ideaRepository.save(idea);
    });
    tagRepository.delete(tag);
    return ResponseEntity.noContent().build();
  }

}
