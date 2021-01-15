package net.feedbacky.app.util.mailservice.notification;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.FileResourceUtils;
import net.feedbacky.app.util.mailservice.MailBuilder;
import net.feedbacky.app.util.mailservice.MailService;

import org.apache.commons.lang3.StringUtils;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2021
 * <p>
 * Maintenance notice about available templates placeholders:
 * ? - if applicable
 * ${event.content}
 * ${event.board.name}
 * ${event.idea.name} ${event.idea.viewLink}
 * ?${event.user.username} ?${event.user.avatar}
 */
public class MailNotificationBuilder {

  public static final MailService.EmailTemplate MAIL_TEMPLATE = MailService.EmailTemplate.SUBSCRIBE_NOTIFICATION;
  public static final String IDEA_COMMENT_TEMPLATE = "mail_templates/notification/idea_comment.template.html";
  public static final String IDEA_STATE_CHANGE_TEMPLATE = "mail_templates/notification/idea_state_change.template.html";
  private String rawHtml = "";
  private int notificationsAmount = 0;

  public MailNotificationBuilder withIdeaCommentedByModerator(Comment comment) {
    String bonusHtml = FileResourceUtils.readFileContents(IDEA_COMMENT_TEMPLATE);
    bonusHtml = parsePlaceholders(bonusHtml, comment.getDescription(), comment.getIdea().getBoard(), comment.getIdea(), comment.getCreator());
    insertNewNotification(bonusHtml);
    return this;
  }

  public MailNotificationBuilder withIdeaTagsChange(Idea idea, String tagsChanged) {
    String bonusHtml = FileResourceUtils.readFileContents(IDEA_STATE_CHANGE_TEMPLATE);
    bonusHtml = parsePlaceholders(bonusHtml, tagsChanged, idea.getBoard(), idea);
    insertNewNotification(bonusHtml);
    return this;
  }

  public MailNotificationBuilder withIdeaStatusChange(Idea idea, String newStatus) {
    String bonusHtml = FileResourceUtils.readFileContents(IDEA_STATE_CHANGE_TEMPLATE);
    bonusHtml = parsePlaceholders(bonusHtml, newStatus, idea.getBoard(), idea);
    insertNewNotification(bonusHtml);
    return this;
  }

  private String parsePlaceholders(String text, String content, Board eventBoard, Idea eventIdea) {
    String newText = text;
    newText = StringUtils.replace(newText, "${event.content}", content);
    newText = StringUtils.replace(newText, "${event.board.name}", eventBoard.getName());
    newText = StringUtils.replace(newText, "${event.idea.name}", eventIdea.getTitle());
    newText = StringUtils.replace(newText, "${event.idea.viewLink}", eventIdea.toViewLink());
    return newText;
  }

  private String parsePlaceholders(String text, String content, Board eventBoard, Idea eventIdea, User eventUser) {
    String newText = text;
    newText = parsePlaceholders(newText, content, eventBoard, eventIdea);
    newText = StringUtils.replace(newText, "${event.user.username}", eventUser.getUsername());
    newText = StringUtils.replace(newText, "${event.user.avatar}", eventUser.getAvatar());
    return newText;
  }

  private void insertNewNotification(String newHtml) {
    if(notificationsAmount == 0) {
      rawHtml += newHtml;
      notificationsAmount++;
      return;
    }
    rawHtml += "<br/><hr><br/>" + newHtml;
    notificationsAmount++;
  }

  public MailBuilder build() {
    String html = MAIL_TEMPLATE.getHtml();
    html = StringUtils.replace(html, "${notifications.rawHtml}", rawHtml);
    html = StringUtils.replace(html, "${notifications.amount}", String.valueOf(notificationsAmount));
    return new MailBuilder()
            .withCustomSubject(MAIL_TEMPLATE.getSubject().replace("${notifications.amount}", String.valueOf(notificationsAmount)))
            .withCustomHtml(html);
  }

}
