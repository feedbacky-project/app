package net.feedbacky.app.service.idea.voter;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.dto.PatchVotersDto;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.MailPreferences;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.InvalidAuthenticationException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.service.idea.IdeaServiceCommons;
import net.feedbacky.app.util.CommentBuilder;
import net.feedbacky.app.util.RandomNicknameUtils;
import net.feedbacky.app.util.request.InternalRequestValidator;
import net.feedbacky.app.util.request.ServiceValidator;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;
import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
@Service
public class VoterServiceImpl implements VoterService {

  private final IdeaRepository ideaRepository;
  private final UserRepository userRepository;
  private final CommentRepository commentRepository;
  private final IdeaServiceCommons ideaServiceCommons;
  private final RandomNicknameUtils randomNicknameUtils;
  private final TriggerExecutor triggerExecutor;

  @Autowired
  public VoterServiceImpl(IdeaRepository ideaRepository, UserRepository userRepository, CommentRepository commentRepository,
                          IdeaServiceCommons ideaServiceCommons, RandomNicknameUtils randomNicknameUtils, TriggerExecutor triggerExecutor) {
    this.ideaRepository = ideaRepository;
    this.userRepository = userRepository;
    this.commentRepository = commentRepository;
    this.ideaServiceCommons = ideaServiceCommons;
    this.randomNicknameUtils = randomNicknameUtils;
    this.triggerExecutor = triggerExecutor;
  }

  @Override
  public List<FetchSimpleUserDto> getAllVoters(long id) {
    Idea idea = ideaRepository.findById(id, EntityGraphUtils.fromAttributePaths("voters"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    return idea.getVoters().stream().map(u -> new FetchSimpleUserDto().from(u)).collect(Collectors.toList());
  }

  @Override
  public List<FetchSimpleUserDto> patchVoters(long id, PatchVotersDto dto) {
    User user = InternalRequestValidator.getRequestUser(userRepository);
    Idea idea = ideaRepository.findById(id, EntityGraphUtils.fromAttributePaths("board", "voters"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    ServiceValidator.isPermitted(idea.getBoard(), Moderator.Role.MODERATOR, user);
    CommentBuilder commentBuilder = new CommentBuilder().by(user).type(Comment.SpecialType.IDEA_VOTES_RESET);
    switch(PatchVotersDto.VotersClearType.valueOf(dto.getClearType().toUpperCase())) {
      case ALL:
        idea.setVoters(new HashSet<>());
        idea.setVotersAmount(0);
        idea = ideaRepository.save(idea);
        commentBuilder = commentBuilder.placeholders(user.convertToSpecialCommentMention(), "all");
        break;
      case ANONYMOUS:
        Set<User> voters = idea.getVoters();
        voters = voters.stream().filter(voter -> !voter.isFake()).collect(Collectors.toSet());
        idea.setVoters(voters);
        idea.setVotersAmount(voters.size());
        idea = ideaRepository.save(idea);
        commentBuilder = commentBuilder.placeholders(user.convertToSpecialCommentMention(), "anonymous");
        break;
      default:
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid clear type provided.");
    }
    Comment comment = commentBuilder.of(idea).build();
    Set<Comment> comments = idea.getComments();
    comments.add(comment);
    idea.setComments(comments);
    commentRepository.save(comment);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_VOTES_RESET)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    return idea.getVoters().stream().map(u -> new FetchSimpleUserDto().from(u)).collect(Collectors.toList());
  }

  @Override
  public FetchUserDto postUpvote(long id, String anonymousId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user;
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.postUpvote"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(auth instanceof AnonymousAuthenticationToken) {
      if(anonymousId == null || !idea.getBoard().isAnonymousAllowed()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Please log-in to vote.");
      }
      user = userRepository.findByEmail(anonymousId).orElseGet(() -> createAnonymousUser(anonymousId));
    } else {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
              .orElseThrow(InvalidAuthenticationException::new);
    }
    return ideaServiceCommons.postUpvote(user, idea);
  }

  @Override
  public ResponseEntity deleteUpvote(long id, String anonymousId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User user;
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.postUpvote"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    if(auth instanceof AnonymousAuthenticationToken) {
      if(anonymousId == null || !idea.getBoard().isAnonymousAllowed()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Please log-in to vote.");
      }
      //if not found and vote deleted then don't create new user
      user = userRepository.findByEmail(anonymousId)
              .orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet upvoted."));
    } else {
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail())
              .orElseThrow(InvalidAuthenticationException::new);
    }
    return ideaServiceCommons.deleteUpvote(user, idea);
  }

  private User createAnonymousUser(String anonymousId) {
    User user = new User();
    user.setEmail(anonymousId);
    MailPreferences preferences = new MailPreferences();
    preferences.setNotificationsEnabled(false);
    preferences.setUnsubscribeToken("");
    preferences.setUser(user);
    user.setMailPreferences(preferences);
    String nick = randomNicknameUtils.getRandomNickname();
    user.setAvatar(System.getenv("REACT_APP_DEFAULT_USER_AVATAR").replace("%nick%", nick));
    user.setUsername(nick);
    user.setFake(true);
    return userRepository.save(user);
  }

}
