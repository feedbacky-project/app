package net.feedbacky.app.service.board.social;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.board.social.SocialLink;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.board.SocialLinksRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.Constants;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.objectstorage.ObjectStorage;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

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
 * Created at 23.12.2019
 */
@Service
public class BoardSocialLinksServiceImpl implements BoardSocialLinksService {

  private final BoardRepository boardRepository;
  private final SocialLinksRepository socialLinksRepository;
  private final UserRepository userRepository;
  private final ObjectStorage objectStorage;

  @Autowired
  public BoardSocialLinksServiceImpl(BoardRepository boardRepository, SocialLinksRepository socialLinksRepository, UserRepository userRepository, ObjectStorage objectStorage) {
    this.boardRepository = boardRepository;
    this.socialLinksRepository = socialLinksRepository;
    this.userRepository = userRepository;
    this.objectStorage = objectStorage;
  }

  @Override
  public List<FetchSocialLinkDto> getAll(String discriminator) {
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphUtils.fromAttributePaths("socialLinks"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    return board.getSocialLinks().stream().map(link -> new FetchSocialLinkDto().from(link)).collect(Collectors.toList());
  }

  @Override
  public ResponseEntity<FetchSocialLinkDto> post(String discriminator, PostSocialLinkDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);

    if(board.getSocialLinks().size() >= 5) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Can't create more than 4 social links.");
    }
    SocialLink socialLink = new SocialLink();

    String data = Base64Util.extractBase64Data(dto.getIconData());
    if(!Constants.DEFAULT_ICONS.containsKey(data)) {
      socialLink.setLogoUrl(objectStorage.storeImage(data, ObjectStorage.ImageType.PROJECT_SOCIAL_ICON));
    } else {
      socialLink.setLogoUrl(Constants.DEFAULT_ICONS.get(data));
    }
    socialLink.setUrl(dto.getUrl());
    socialLink.setBoard(board);
    socialLink = socialLinksRepository.save(socialLink);
    board.getSocialLinks().add(socialLink);
    boardRepository.save(board);
    return ResponseEntity.status(HttpStatus.CREATED).body(new FetchSocialLinkDto().from(socialLink));
  }

  @Override
  public ResponseEntity delete(long id) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    SocialLink socialLink = socialLinksRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Social link with id {0} not found.", id)));
    Board board = socialLink.getBoard();
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);

    objectStorage.deleteImage(socialLink.getLogoUrl());
    board.getSocialLinks().remove(socialLink);
    socialLinksRepository.delete(socialLink);
    boardRepository.save(board);
    return ResponseEntity.noContent().build();
  }
}
