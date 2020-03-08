package net.feedbacky.app.utils;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.invite.Invitation;
import net.feedbacky.app.rest.data.user.User;

import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Stream;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
public class MailgunEmailHelper {

  private static String apiKey = System.getenv("SERVER_MAILGUN_API_KEY");
  private static String baseUrl = System.getenv("SERVER_MAILGUN_API_BASE_URL");

  private MailgunEmailHelper() {
  }

  public static void sendEmail(EmailTemplate template, Invitation invitation, String to) throws UnirestException {
    Unirest.post(baseUrl + "/messages")
            .basicAuth("api", apiKey)
            .queryString("from", "Feedbacky <no-reply@feedbacky.net>")
            .queryString("to", to)
            .queryString("subject", parsePlaceholders(template, template.getSubject(), invitation))
            .queryString("text", parsePlaceholders(template, template.getLegacyText(), invitation))
            .queryString("html", parsePlaceholders(template, template.getHtml(), invitation))
            .asJson();
  }

  public static void sendEmail(EmailTemplate template, Board board, User user, String to) throws UnirestException {
    Unirest.post(baseUrl + "/messages")
            .basicAuth("api", apiKey)
            .queryString("from", "Feedbacky <no-reply@feedbacky.net>")
            .queryString("to", to)
            .queryString("subject", parsePlaceholders(template.getSubject(), board, user))
            .queryString("text", parsePlaceholders(template.getLegacyText(), board, user))
            .queryString("html", parsePlaceholders(template.getHtml(), board, user))
            .asJson();
  }

  public static void sendEmail(EmailTemplate template, User user, String to) throws UnirestException {
    Unirest.post(baseUrl + "/messages")
            .basicAuth("api", apiKey)
            .queryString("from", "Feedbacky <no-reply@feedbacky.net>")
            .queryString("to", to)
            .queryString("subject", parsePlaceholders(template.getSubject(), user))
            .queryString("text", parsePlaceholders(template.getLegacyText(), user))
            .queryString("html", parsePlaceholders(template.getHtml(), user))
            .asJson();
  }

  private static String parsePlaceholders(EmailTemplate template, String html, Invitation invitation) {
    html = StringUtils.replace(html, "${board.logo}", invitation.getBoard().getBanner());
    html = StringUtils.replace(html, "${board.name}", invitation.getBoard().getName());
    html = StringUtils.replace(html, "${board.owner}", invitation.getBoard().getCreator().getUsername());
    html = StringUtils.replace(html, "${username}", invitation.getUser().getUsername());
    html = StringUtils.replace(html, "${invite.link}", template.getInviteLink() + invitation.getCode());
    return html;
  }

  private static String parsePlaceholders(String html, Board board, User user) {
    html = StringUtils.replace(html, "${board.logo}", board.getBanner());
    html = StringUtils.replace(html, "${board.name}", board.getName());
    html = StringUtils.replace(html, "${board.owner}", board.getCreator().getUsername());
    html = StringUtils.replace(html, "${username}", user.getUsername());
    return html;
  }

  private static String parsePlaceholders(String html, User user) {
    html = StringUtils.replace(html, "${username}", user.getUsername());
    return html;
  }

  public enum EmailTemplate {
    BOARD_INVITATION("mail_templates/invitation_join.html", "https://app.feedbacky.net/invitation/", "${board.name} - Invitation",
            "You've been invited to private ${board.name} board. Join here ${invite.link} (HTML not supported, default message sent)"),
    MODERATOR_INVITATION("mail_templates/moderator_invitation.html", "https://app.feedbacky.net/moderator_invitation/", "${board.name} - Moderator Invitation",
            "You've been invited to moderate ${board.name} board. Join here ${invite.link} (HTML not supported, default message sent)"),
    MODERATOR_KICKED("mail_templates/moderator_kicked.html", "", "${board.name} - Moderator Privileges Revoked",
            "Your moderator privileges from board ${board.name} were revoked. (HTML not supported, default message sent)"),
    BOARD_DELETED("mail_templates/board_deleted.html", "", "${board.name} - Board Removal Initiated",
            "You requested to remove board ${board.name} and your request was proceeded and executed. (HTML not supported, default message sent)"),
    ACCOUNT_DEACTIVATED("mail_templates/account_deactivated.html", "", "${username} - Account Deactivated",
            "You requested to deactivate your ${username} account and we executed the request, your account was anonymized. (HTML not supported, default message sent)");

    private String html;
    private String inviteLink;
    private String subject;
    private String legacyText;

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

    private String readLineByLine(String filePath) {
      StringBuilder contentBuilder = new StringBuilder();
      try(Stream<String> stream = Files.lines(Paths.get(filePath), StandardCharsets.UTF_8)) {
        stream.forEach(s -> contentBuilder.append(s).append("\n"));
      } catch(IOException e) {
        e.printStackTrace();
      }
      return contentBuilder.toString();
    }

  }

}
