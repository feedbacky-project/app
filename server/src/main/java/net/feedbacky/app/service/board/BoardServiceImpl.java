package net.feedbacky.app.service.board;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.PatchBoardDto;
import net.feedbacky.app.data.board.dto.PostBoardDto;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.service.board.integration.IntegrationService;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.NewBoardPopulator;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;
import net.feedbacky.app.util.objectstorage.ObjectStorage;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.text.StringEscapeUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
@Service
public class BoardServiceImpl implements BoardService {

  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final ObjectStorage objectStorage;
  private final MailHandler mailHandler;
  private final TriggerExecutor triggerExecutor;
  private final IntegrationService integrationService;
  private final NewBoardPopulator newBoardPopulator;

  @Autowired
  public BoardServiceImpl(BoardRepository boardRepository, UserRepository userRepository, ObjectStorage objectStorage, MailHandler mailHandler,
                          TriggerExecutor triggerExecutor, IntegrationService integrationService, NewBoardPopulator newBoardPopulator) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.objectStorage = objectStorage;
    this.mailHandler = mailHandler;
    this.triggerExecutor = triggerExecutor;
    this.integrationService = integrationService;
    this.newBoardPopulator = newBoardPopulator;
  }

  @Override
  public PaginableRequest<List<FetchBoardDto>> getAll(int page, int pageSize) {
    Page<Board> pageData = boardRepository.findAll(PageRequest.of(page, pageSize), EntityGraphs.named("Board.fetch"));
    List<Board> boards = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    //no confidential data for paginated requests
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize),
            boards.stream().map(Board::toDto).collect(Collectors.toList()));
  }

  @Override
  public FetchBoardDto getOne(String discriminator) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphs.named("Board.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    final User finalUser = user;
    boolean allowConfidential = false;
    if(finalUser != null) {
      allowConfidential = board.getCreator().equals(user)
              || board.getModerators().stream().anyMatch(mod -> mod.getUser().equals(finalUser) && mod.getRole() == Moderator.Role.ADMINISTRATOR);
    }
    return board.toDto().withConfidentialData(board, allowConfidential);
  }

  @Override
  public ResponseEntity<FetchBoardDto> post(PostBoardDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    if(!user.isServiceStaff()) {
      throw new InsufficientPermissionsException();
    }
    if(boardRepository.findByDiscriminator(dto.getDiscriminator()).isPresent()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Board with that discriminator already exists.");
    }
    if(dto.getBanner() == null || dto.getLogo() == null) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Banner and logo for board must be set.");
    }
    Board board = dto.convertToEntity();

    //sanitize
    board.setShortDescription(StringEscapeUtils.escapeHtml4(dto.getShortDescription()));
    board.setFullDescription(StringEscapeUtils.escapeHtml4(dto.getFullDescription()));

    board.setCreator(user);

    //after save board id is set, so now we can set banners and logos that require board id
    String logoUrl = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getLogo()), ObjectStorage.ImageType.PROJECT_LOGO);
    if(logoUrl.equals("")) {
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Server-side error while uploading logo.");
    }
    board.setLogo(logoUrl);
    String bannerUrl = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getBanner()), ObjectStorage.ImageType.PROJECT_BANNER);
    if(bannerUrl.equals("")) {
      throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Server-side error while uploading banner.");
    }
    board.setBanner(bannerUrl);
    board = boardRepository.save(board);

    Moderator node = new Moderator();
    node.setRole(Moderator.Role.OWNER);
    node.setBoard(board);
    node.setUser(user);
    user.getPermissions().add(node);
    userRepository.save(user);
    newBoardPopulator.doPopulateBoard(board);
    return ResponseEntity.status(HttpStatus.CREATED).body(board.toDto().withConfidentialData(board, true));
  }

  @Override
  public FetchBoardDto patch(String discriminator, PatchBoardDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.ADMINISTRATOR, user);

    //convert and update base64 images
    if(dto.getBanner() != null) {
      //delete old banner if necessary
      objectStorage.deleteImage(board.getBanner());
      String bannerUrl = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getBanner()), ObjectStorage.ImageType.PROJECT_BANNER);
      if(bannerUrl.equals("")) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Server-side error while uploading banner.");
      }
      dto.setBanner(bannerUrl);
    }
    if(dto.getLogo() != null) {
      //delete old logo if necessary
      objectStorage.deleteImage(board.getLogo());
      String logoUrl = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getLogo()), ObjectStorage.ImageType.PROJECT_LOGO);
      if(logoUrl.equals("")) {
        throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Server-side error while uploading logo.");
      }
      dto.setLogo(logoUrl);
    }
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, board);

    //unsanitize and sanitize again
    //by doing this we ensure that content user sends is raw and then its sanitized once not sent sanitized and sanitized once again
    board.setShortDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(board.getShortDescription())));
    board.setFullDescription(StringEscapeUtils.escapeHtml4(StringEscapeUtils.unescapeHtml4(board.getFullDescription())));

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_SETTINGS_EDIT)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board)
            .build()
    );
    board = boardRepository.save(board);
    return board.toDto().withConfidentialData(board, true);
  }

  @Override
  public ResponseEntity delete(String discriminator) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Board board = boardRepository.findByDiscriminator(discriminator)
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    ServiceValidator.isPermitted(board, Moderator.Role.OWNER, user);
    new MailBuilder()
            .withRecipient(board.getCreator())
            .withEventBoard(board)
            .withTemplate(MailService.EmailTemplate.BOARD_DELETED)
            .sendMail(mailHandler.getMailService()).sync();

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.BOARD_DELETE)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(board)
            .build()
    );
    board.getModerators().forEach(moderator -> {
      User modUser = moderator.getUser();
      modUser.getPermissions().remove(moderator);
      userRepository.save(modUser);
    });
    board.getIntegrations().forEach(i -> integrationService.delete(i.getId()));
    board.getSocialLinks().forEach(link -> objectStorage.deleteImage(link.getLogoUrl()));
    board.getIdeas().forEach(idea -> idea.getAttachments().forEach(attachment -> objectStorage.deleteImage(attachment.getUrl())));
    objectStorage.deleteImage(board.getBanner());
    objectStorage.deleteImage(board.getLogo());
    boardRepository.delete(board);
    return ResponseEntity.noContent().build();
  }

}
