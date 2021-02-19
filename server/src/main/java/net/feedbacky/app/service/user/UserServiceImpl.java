package net.feedbacky.app.service.user;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchConnectedAccount;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.data.user.dto.PatchMailPreferences;
import net.feedbacky.app.data.user.dto.PatchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.RandomNicknameUtils;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
@Service
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final MailHandler mailHandler;
  private final RandomNicknameUtils randomNicknameUtils;

  @Autowired
  public UserServiceImpl(UserRepository userRepository, MailHandler mailHandler, RandomNicknameUtils randomNicknameUtils) {
    this.userRepository = userRepository;
    this.mailHandler = mailHandler;
    this.randomNicknameUtils = randomNicknameUtils;
  }

  @Override
  public FetchUserDto getSelf() {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphs.named("User.fetch"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    return new FetchUserDto().from(user).withConfidentialData(user);
  }

  @Override
  public List<FetchConnectedAccount> getSelfConnectedAccounts() {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail(), EntityGraphs.named("User.fetchConnections"))
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    return user.getConnectedAccounts().stream().map(acc -> new FetchConnectedAccount().from(acc)).collect(Collectors.toList());
  }

  @Override
  public FetchUserDto get(long id) {
    User user = userRepository.findById(id, EntityGraphs.named("User.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("User with id {0} not found.", id)));
    return new FetchUserDto().from(user);
  }

  @Override
  public FetchUserDto patchSelf(PatchUserDto dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));

    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, user);
    userRepository.save(user);
    return new FetchUserDto().from(user).withConfidentialData(user);
  }

  @Override
  public FetchUserDto patchSelfMailPreferences(PatchMailPreferences dto) {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));

    MailPreferences preferences = user.getMailPreferences();
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, preferences);
    user.setMailPreferences(preferences);
    userRepository.save(user);
    return new FetchUserDto().from(user).withConfidentialData(user);
  }

  @Override
  public ResponseEntity unsubscribe(long id, String code) {
    User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("User with id {0} not found.", id)));
    MailPreferences preferences = user.getMailPreferences();
    if(!preferences.getUnsubscribeToken().equals(code)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid unsubscribe token.");
    }
    user.getMailPreferences().setNotificationsEnabled(false);
    user.getMailPreferences().setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
    userRepository.save(user);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deactivateSelf() {
    UserAuthenticationToken auth = InternalRequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("Session not found. Try again with new token."));
    //better to run sync now
    new MailBuilder()
            .withRecipient(user)
            .withTemplate(MailService.EmailTemplate.ACCOUNT_DEACTIVATED)
            .sendMail(mailHandler.getMailService()).sync();
    user.setEmail("deactivated-" + RandomStringUtils.randomAlphanumeric(6) + "@feedbacky.net");
    String nick = randomNicknameUtils.getRandomNickname();
    user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", nick));
    user.setUsername(nick);
    user.setConnectedAccounts(new HashSet<>());
    MailPreferences mailPreferences = user.getMailPreferences();
    mailPreferences.setNotificationsEnabled(false);
    userRepository.save(user);
    return ResponseEntity.noContent().build();
  }
}
