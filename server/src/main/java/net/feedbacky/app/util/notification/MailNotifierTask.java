package net.feedbacky.app.util.notification;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.subscribe.SubscriptionExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.util.mailservice.MailHandler;
import net.feedbacky.app.util.mailservice.MailService;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2021
 */
@Component
public class MailNotifierTask {

  private MailHandler mailHandler;
  private SubscriptionExecutor subscriptionExecutor;
  private IdeaRepository ideaRepository;
  private CommentRepository commentRepository;

  @Autowired
  public MailNotifierTask(MailHandler mailHandler, SubscriptionExecutor subscriptionExecutor, IdeaRepository ideaRepository, CommentRepository commentRepository) {
    this.mailHandler = mailHandler;
    this.subscriptionExecutor = subscriptionExecutor;
    this.ideaRepository = ideaRepository;
    this.commentRepository = commentRepository;
  }

  @Scheduled(fixedRate = 1000 * 60 * 5 /* 5 minutes */)
  private void sendNotificationMailsTask() {
    for(Map.Entry<User, List<Pair<SubscriptionExecutor.Event, Map<String, String>>>> entry : subscriptionExecutor.getNotificationBuffer().entrySet()) {
      User user = entry.getKey();
      MailNotificationBuilder builder = new MailNotificationBuilder();
      builder = builder.withUser(user);
      for(Pair<SubscriptionExecutor.Event, Map<String, String>> event : entry.getValue()) {
        Map<String, String> data = event.getRight();
        String status;
        Idea idea;
        switch(event.getLeft()) {
          case IDEA_BY_MODERATOR_COMMENT:
            //todo null checks
            Comment comment = commentRepository.findById(Long.parseLong(data.get(SubscriptionExecutor.SubscriptionMapData.COMMENT_ID.getName()))).get();
            builder = builder.withIdeaCommentedByModerator(comment);
            break;
          case IDEA_STATUS_CHANGE:
            //todo null checks
            idea = ideaRepository.findById(Long.parseLong(data.get(SubscriptionExecutor.SubscriptionMapData.IDEA_ID.getName()))).get();
            status = "Idea status changed to " + data.get(SubscriptionExecutor.SubscriptionMapData.NEW_STATUS.getName());
            builder = builder.withIdeaStatusChange(idea, status);
            break;
          case IDEA_TAGS_CHANGE:
            //todo null checks
            idea = ideaRepository.findById(Long.parseLong(data.get(SubscriptionExecutor.SubscriptionMapData.IDEA_ID.getName()))).get();
            status = data.get(SubscriptionExecutor.SubscriptionMapData.TAGS_CHANGED.getName());
            builder = builder.withIdeaStatusChange(idea, status);
            break;
          default:
            break;
        }
      }
      final String html = builder.buildHtml();
      final int amount = builder.getNotificationsAmount();
      MailService.EmailTemplate template = MailNotificationBuilder.MAIL_TEMPLATE;
      CompletableFuture.runAsync(() -> mailHandler.getMailService().send(user.getEmail(),
              template.getSubject().replace("${notifications.amount}", String.valueOf(amount)), template.getLegacyText(), html));
    }
    subscriptionExecutor.emptyNotificationBuffer();
  }

}
