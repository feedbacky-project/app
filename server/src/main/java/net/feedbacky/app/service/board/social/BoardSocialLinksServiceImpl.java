package net.feedbacky.app.service.board.social;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.SocialLinksRepository;
import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.rest.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.rest.data.board.moderator.Moderator;
import net.feedbacky.app.rest.data.board.social.SocialLink;
import net.feedbacky.app.rest.data.user.User;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.utils.Base64Utils;
import net.feedbacky.app.utils.Constants;
import net.feedbacky.app.utils.RequestValidator;
import net.feedbacky.app.utils.objectstorage.ObjectStorage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Service
public class BoardSocialLinksServiceImpl implements BoardSocialLinksService {

  private BoardRepository boardRepository;
  private SocialLinksRepository socialLinksRepository;
  private UserRepository userRepository;
  private ObjectStorage objectStorage;

  @Autowired
  public BoardSocialLinksServiceImpl(BoardRepository boardRepository, SocialLinksRepository socialLinksRepository, UserRepository userRepository, ObjectStorage objectStorage) {
    this.boardRepository = boardRepository;
    this.socialLinksRepository = socialLinksRepository;
    this.userRepository = userRepository;
    this.objectStorage = objectStorage;
  }

  @Override
  public List<FetchSocialLinkDto> getAll(String discriminator) {
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found"));
    return board.getSocialLinks().stream().map(SocialLink::convertToDto).collect(Collectors.toList());
  }

  @Override
  public ResponseEntity<FetchSocialLinkDto> post(String discriminator, PostSocialLinkDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException("Board with discriminator " + discriminator + " not found"));
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to post social links to this board.");
    }
    if(board.getSocialLinks().size() >= 4) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Cannot post more than 4 social links per board.");
    }
    SocialLink socialLink = new SocialLink();

    String data = Base64Utils.extractBase64Data(dto.getIconData());
    if(!Constants.DEFAULT_ICONS.keySet().contains(data)) {
      socialLink.setLogoUrl(objectStorage.storeImage(data, ObjectStorage.ImageType.PROJECT_SOCIAL_ICON));
    } else {
      socialLink.setLogoUrl(Constants.DEFAULT_ICONS.get(data));
    }
    socialLink.setUrl(dto.getUrl());
    socialLink.setBoard(board);
    socialLink = socialLinksRepository.save(socialLink);
    board.getSocialLinks().add(socialLink);
    boardRepository.save(board);
    return ResponseEntity.status(HttpStatus.CREATED).body(socialLink.convertToDto());
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    SocialLink socialLink = socialLinksRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Social link with id " + id + " not found"));
    Board board = socialLink.getBoard();
    if(!hasPermission(board, Moderator.Role.OWNER, user)) {
      throw new InvalidAuthenticationException("No permission to delete social links from this board.");
    }
    objectStorage.deleteImage(socialLink.getLogoUrl());
    board.getSocialLinks().remove(socialLink);
    socialLinksRepository.delete(socialLink);
    boardRepository.save(board);
    return ResponseEntity.noContent().build();
  }
}
