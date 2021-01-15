package net.feedbacky.app.util.mailservice;

import net.feedbacky.app.util.FileResourceUtils;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
public interface MailService {

  String HOST_ADDRESS = System.getenv("REACT_APP_SERVER_IP_ADDRESS");

  void send(String to, String subject, String text, String html);

  enum EmailTemplate {
    MODERATOR_INVITATION("mail_templates/moderator_invitation.html", HOST_ADDRESS + "/moderator_invitation/", "${board.name} - Moderator Invitation",
            "You've been invited to moderate ${board.name} board. Join here ${invite.link} (HTML not supported, default message sent)"),
    MODERATOR_KICKED("mail_templates/moderator_kicked.html", "", "${board.name} - Moderator Privileges Revoked",
            "Your moderator privileges from board ${board.name} were revoked. (HTML not supported, default message sent)"),
    BOARD_DELETED("mail_templates/board_deleted.html", "", "${board.name} - Board Removal Initiated",
            "You requested to remove board ${board.name} and your request was proceeded and executed. (HTML not supported, default message sent)"),
    ACCOUNT_DEACTIVATED("mail_templates/account_deactivated.html", "", "${username} - Account Deactivated",
            "You requested to deactivate your ${username} account and we executed the request, your account was anonymized. (HTML not supported, default message sent)"),
    SUBSCRIBE_NOTIFICATION("mail_templates/notification/new_notifications.html", "", "${notifications.amount} New Notification(s) Received",
            "You received new notifications, however, you can see them only when HTML is supported (HTML not supported, default message sent)");

    private final String html;
    private final String inviteLink;
    private final String subject;
    private final String legacyText;

    EmailTemplate(String templateFile, String inviteLink, String subject, String legacyText) {
      this.html = FileResourceUtils.readFileContents(templateFile);
      this.inviteLink = inviteLink;
      this.subject = subject;
      this.legacyText = legacyText;
    }

    public String getHtml() {
      return html;
    }

    public String getInviteLink() {
      return inviteLink;
    }

    public String getSubject() {
      return subject;
    }

    public String getLegacyText() {
      return legacyText;
    }
  }

}
