package net.feedbacky.app.service.board.apikey;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@Service
public class ApiKeyServiceImpl implements ApiKeyService {

  private BoardRepository boardRepository;
  private UserRepository userRepository;

  @Autowired
  public ApiKeyServiceImpl(BoardRepository boardRepository, UserRepository userRepository) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
  }

  @Override
  public ResponseEntity<FetchBoardDto> patch(String discriminator) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found"));
    if(!ServiceValidator.hasPermission(board, Moderator.Role.ADMINISTRATOR, user)) {
      throw new InvalidAuthenticationException("No permission to manage api keys for this board.");
    }
    board.setApiKey(RandomStringUtils.randomAlphanumeric(40));
    boardRepository.save(board);
    return ResponseEntity.ok(new FetchBoardDto().from(board).withConfidentialData(board, true));
  }

  @Override
  public ResponseEntity delete(String discriminator) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found"));
    if(!ServiceValidator.hasPermission(board, Moderator.Role.ADMINISTRATOR, user)) {
      throw new InvalidAuthenticationException("No permission to manage api keys for this board.");
    }
    if(board.getApiKey().equals("")) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Api key is already disabled.");
    }
    board.setApiKey("");
    boardRepository.save(board);
    return ResponseEntity.ok(new FetchBoardDto().from(board).withConfidentialData(board, true));
  }

}
