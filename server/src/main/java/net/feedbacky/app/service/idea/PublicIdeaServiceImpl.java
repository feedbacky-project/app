package net.feedbacky.app.service.idea;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.PublicApiRequest;
import net.feedbacky.app.util.request.PublicRequestValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;

import java.text.MessageFormat;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@Service
public class PublicIdeaServiceImpl implements PublicIdeaService {

  private BoardRepository boardRepository;
  private IdeaRepository ideaRepository;
  private IdeaServiceCommons ideaServiceCommons;
  private PublicRequestValidator publicRequestValidator;

  @Autowired
  public PublicIdeaServiceImpl(BoardRepository boardRepository, IdeaRepository ideaRepository, IdeaServiceCommons ideaServiceCommons, PublicRequestValidator publicRequestValidator) {
    this.boardRepository = boardRepository;
    this.ideaRepository = ideaRepository;
    this.ideaServiceCommons = ideaServiceCommons;
    this.publicRequestValidator = publicRequestValidator;
  }

  @Override
  public PublicApiRequest<PaginableRequest<List<FetchIdeaDto>>> getAllIdeas(String discriminator, int page, int pageSize, IdeaService.FilterType filter, IdeaService.SortType sort) {
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    publicRequestValidator.validateApiKeyFromRequest(request, board);
    User user = publicRequestValidator.getUserByTokenOnly(request);
    return new PublicApiRequest<>(user == null ? null : user.getToken(), ideaServiceCommons.getAllIdeas(board, user, page, pageSize, filter, sort));
  }

  @Override
  public PublicApiRequest<FetchIdeaDto> getOne(long id) {
    Idea idea = ideaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    Board board = idea.getBoard();
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    publicRequestValidator.validateApiKeyFromRequest(request, board);
    User user = publicRequestValidator.getUserByTokenOnly(request);
    return new PublicApiRequest<>(user == null ? null : user.getToken(), new FetchIdeaDto().from(idea).withUser(idea, user));
  }

  @Override
  public ResponseEntity<PublicApiRequest<FetchIdeaDto>> post(PostIdeaDto dto) {
    Board board = boardRepository.findByDiscriminator(dto.getDiscriminator())
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", dto.getDiscriminator())));
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    publicRequestValidator.validateApiKeyFromRequest(request, board);
    User user = publicRequestValidator.getUser(board, request);
    PublicApiRequest<FetchIdeaDto> data = new PublicApiRequest<>(user.getToken(), ideaServiceCommons.post(dto, board, user));
    return ResponseEntity.status(HttpStatus.CREATED).body(data);
  }

  @Override
  public PublicApiRequest<FetchUserDto> postUpvote(long id) {
    Idea idea = ideaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    Board board = idea.getBoard();
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    publicRequestValidator.validateApiKeyFromRequest(request, board);
    User user = publicRequestValidator.getUser(board, request);
    return new PublicApiRequest<>(user.getToken(), ideaServiceCommons.postUpvote(user, idea));
  }

  @Override
  public ResponseEntity<PublicApiRequest<?>> deleteUpvote(long id) {
    Idea idea = ideaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    Board board = idea.getBoard();
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    publicRequestValidator.validateApiKeyFromRequest(request, board);
    User user = publicRequestValidator.getUser(board, request);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new PublicApiRequest<>(user.getToken(), ideaServiceCommons.deleteUpvote(user, idea)));
  }

}
