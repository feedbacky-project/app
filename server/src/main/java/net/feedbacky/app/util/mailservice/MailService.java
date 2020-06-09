package net.feedbacky.app.util.mailservice;

import lombok.SneakyThrows;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

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
    SUBSCRIBE_COMMENT("mail_templates/subscription/idea_commented.html", "", "Subscribed Idea Commented",
            "Idea you're subscribed to was commented. (HTML not supported, default message sent)"),
    SUBSCRIBE_TAGS_CHANGE("mail_templates/subscription/idea_state_changed.html", "", "Subscribed Idea Tags Changed",
            "Idea you're subscribed to tags were changed. (HTML not supported, default message sent)"),
    SUBSCRIBE_STATUS_CHANGE("mail_templates/subscription/idea_state_changed.html", "", "Subscribed Idea Status Changed",
            "Idea you're subscribed to status was changed. (HTML not supported, default message sent)");

    private final String html;
    private final String inviteLink;
    private final String subject;
    private final String legacyText;

    EmailTemplate(String templateFile, String inviteLink, String subject, String legacyText) {
      this.html = readLineByLine(templateFile);
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

    @SneakyThrows
    private String readLineByLine(String filePath) {
      Resource resource = new ClassPathResource(filePath);
      InputStream inputStream = resource.getInputStream();
      StringBuilder contentBuilder = new StringBuilder();
      try(BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
        for(String line; (line = br.readLine()) != null;) {
          contentBuilder.append(line).append("\n");
        }
      }
      return contentBuilder.toString();
    }
  }

}
