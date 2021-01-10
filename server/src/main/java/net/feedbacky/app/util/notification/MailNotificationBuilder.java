package net.feedbacky.app.util.notification;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.util.FileResourceUtils;
import net.feedbacky.app.util.mailservice.MailPlaceholderParser;
import net.feedbacky.app.util.mailservice.MailService;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2021
 */
public class MailNotificationBuilder {

  public static final MailService.EmailTemplate MAIL_TEMPLATE = MailService.EmailTemplate.SUBSCRIBE_NOTIFICATION;
  public static final String IDEA_COMMENT_TEMPLATE = "mail_templates/notification/idea_comment.template.html";
  public static final String IDEA_STATE_CHANGE_TEMPLATE = "mail_templates/notification/idea_state_change.template.html";
  private String rawHtml = "";
  private int notificationsAmount = 0;
  private User user;

  public int getNotificationsAmount() {
    return notificationsAmount;
  }

  public MailNotificationBuilder withUser(User user) {
    this.user = user;
    return this;
  }

  public MailNotificationBuilder withIdeaCommentedByModerator(Comment comment) {
    rawHtml += MailPlaceholderParser.parseAllAvailablePlaceholders(FileResourceUtils.readFileContents(IDEA_COMMENT_TEMPLATE), MAIL_TEMPLATE,
            comment.getIdea().getBoard(), comment.getCreator(), null)
            .replace("${content}", comment.getDescription())
            .replace("${idea.viewLink}", comment.getIdea().toViewLink());
    notificationsAmount++;
    return this;
  }

  public MailNotificationBuilder withIdeaTagsChange(Idea idea, String tagsChanged) {
    rawHtml += MailPlaceholderParser.parseAllAvailablePlaceholders(FileResourceUtils.readFileContents(IDEA_STATE_CHANGE_TEMPLATE), MAIL_TEMPLATE,
            idea.getBoard(), null, null)
            .replace("${content}", tagsChanged)
            .replace("${idea.viewLink}", idea.toViewLink());
    notificationsAmount++;
    return this;
  }

  public MailNotificationBuilder withIdeaStatusChange(Idea idea, String newStatus) {
    rawHtml += MailPlaceholderParser.parseAllAvailablePlaceholders(FileResourceUtils.readFileContents(IDEA_STATE_CHANGE_TEMPLATE), MAIL_TEMPLATE,
            idea.getBoard(), null, null)
            .replace("${content}", newStatus)
            .replace("${idea.viewLink}", idea.toViewLink());
    notificationsAmount++;
    return this;
  }

  public String buildHtml() {
    return MailPlaceholderParser.parseAllAvailablePlaceholders(MAIL_TEMPLATE.getHtml().replace("${notifications.rawHtml}", rawHtml), MAIL_TEMPLATE,
            null, user, null)
            .replace("${notifications.amount}", String.valueOf(notificationsAmount));
  }

}
