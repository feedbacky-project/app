package net.feedbacky.app.service.user;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.dto.PatchMailPreferences;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.data.user.ConnectedAccount;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchConnectedAccount;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.data.user.dto.PatchUserDto;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.RequestValidator;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailPlaceholderParser;
import net.feedbacky.app.util.mailservice.MailService;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

  @Autowired
  public UserServiceImpl(UserRepository userRepository, MailHandler mailHandler) {
    this.userRepository = userRepository;
    this.mailHandler = mailHandler;
  }

  @Override
  public FetchUserDto getSelf() {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    return user.convertToDto().exposeSensitiveData(true);
  }

  @Override
  public List<FetchConnectedAccount> getSelfConnectedAccounts() {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    return user.getConnectedAccounts().stream().map(ConnectedAccount::convertToDto).collect(Collectors.toList());
  }

  @Override
  public FetchUserDto get(long id) {
    User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User does not exist of id " + id));
    TypeReference<HashMap<String, Object>> ref = new TypeReference<HashMap<String, Object>>() {};
    Map<String, Object> data = new ObjectMapper().convertValue(user.convertToDto().exposeSensitiveData(false), ref);
    return new ObjectMapper().convertValue(data, FetchUserDto.class);
  }

  @Override
  public FetchUserDto patchSelf(PatchUserDto dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));

    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, user);
    userRepository.save(user);
    return user.convertToDto().exposeSensitiveData(true);
  }

  @Override
  public FetchUserDto patchSelfMailPreferences(PatchMailPreferences dto) {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));

    MailPreferences preferences = user.getMailPreferences();
    ModelMapper mapper = new ModelMapper();
    mapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
    mapper.map(dto, preferences);
    user.setMailPreferences(preferences);
    userRepository.save(user);
    return user.convertToDto().exposeSensitiveData(true);
  }

  @Override
  public ResponseEntity unsubscribe(long id, String code) {
    User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User does not exist of id " + id));
    MailPreferences preferences = user.getMailPreferences();
    if(!preferences.getUnsubscribeToken().equals(code)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid unsubscribe token.");
    }
    user.getMailPreferences().setNotifyFromModeratorsComments(false);
    user.getMailPreferences().setNotifyFromStatusChange(false);
    user.getMailPreferences().setNotifyFromTagsChange(false);
    user.getMailPreferences().setUnsubscribeToken(RandomStringUtils.randomAlphanumeric(6));
    userRepository.save(user);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity deactivateSelf() {
    UserAuthenticationToken auth = RequestValidator.getContextAuthentication();
    User user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
            .orElseThrow(() -> new InvalidAuthenticationException("User session not found. Try again with new token"));
    //better to run sync now
    MailService.EmailTemplate template = MailService.EmailTemplate.ACCOUNT_DEACTIVATED;
    String subject = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getSubject(), template, null, user, null);
    String text = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getLegacyText(), template, null, user, null);
    String html = MailPlaceholderParser.parseAllAvailablePlaceholders(template.getHtml(), template, null, user, null);
    mailHandler.getMailService().send(user.getEmail(), subject, text, html);
    user.setEmail("deactivated-" + RandomStringUtils.randomAlphanumeric(6) + "@feedbacky.net");
    user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", "Anonymous"));
    user.setUsername("Anonymous");
    user.setConnectedAccounts(new HashSet<>());
    MailPreferences mailPreferences = user.getMailPreferences();
    mailPreferences.setNotifyFromTagsChange(false);
    mailPreferences.setNotifyFromStatusChange(false);
    mailPreferences.setNotifyFromModeratorsComments(false);
    userRepository.save(user);
    return ResponseEntity.noContent().build();
  }
}
