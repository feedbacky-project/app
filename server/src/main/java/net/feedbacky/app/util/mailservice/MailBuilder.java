package net.feedbacky.app.util.mailservice;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.user.User;

import com.google.errorprone.annotations.CheckReturnValue;

import org.apache.commons.lang3.StringUtils;

import java.util.concurrent.CompletableFuture;

/**
 * @author Plajer
 * <p>
 * Created at 12.01.2021
 *
 * Maintenance notice about available placeholders:
 * ? - if applicable
 * ${host.address} ${username} ${avatar} ${unsubscribe_link}
 * ?${board.name} ?${board.owner.name}
 * ?${invitation.link} ?${invitation.username}
 */
public class MailBuilder {

  private MailService.EmailTemplate template;
  private String subject = null;
  private String html = null;
  private String text = null;
  private Board board = null;
  private Invitation invitation = null;
  private User recipient;

  public MailBuilder withTemplate(MailService.EmailTemplate template) {
    this.template = template;
    return this;
  }

  public MailBuilder withRecipient(User recipient) {
    this.recipient = recipient;
    return this;
  }

  public MailBuilder withCustomSubject(String subject) {
    this.subject = subject;
    return this;
  }

  public MailBuilder withCustomHtml(String html) {
    this.html = html;
    return this;
  }

  public MailBuilder withCustomText(String text) {
    this.text = text;
    return this;
  }

  public MailBuilder withEventBoard(Board board) {
    this.board = board;
    return this;
  }

  public MailBuilder withInvitation(Invitation invitation) {
    this.invitation = invitation;
    return this;
  }

  @CheckReturnValue
  public MailSendDetails sendMail(MailService service) {
    return new MailSendDetails(service);
  }

  public class MailSendDetails {

    private MailService service;

    public MailSendDetails(MailService service) {
      this.service = service;
    }

    public void async() {
      CompletableFuture.runAsync(this::doSend);
    }

    public void sync() {
      doSend();
    }

    private void doSend() {
      String customSubject = parsePlaceholders(subject == null ? template.getSubject() : subject);
      String customHtml = parsePlaceholders(html == null ? template.getHtml() : html);
      String customText = parsePlaceholders(text == null ? template.getLegacyText() : text);
      service.send(recipient.getEmail(), customSubject, customText, customHtml);
    }

    private String parsePlaceholders(String text) {
      String newText = text;
      newText = StringUtils.replace(newText, "${host.address}", MailService.HOST_ADDRESS);
      newText = StringUtils.replace(newText, "${username}", recipient.getUsername());
      newText = StringUtils.replace(newText, "${avatar}", recipient.getAvatar());
      newText = StringUtils.replace(newText, "${unsubscribe_link}", MailService.HOST_ADDRESS + "/unsubscribe/"
              + recipient.getId() + "/" + recipient.getMailPreferences().getUnsubscribeToken());
      if(board != null) {
        newText = StringUtils.replace(newText, "${board.name}", board.getName());
        newText = StringUtils.replace(newText, "${board.owner.name}", board.getCreator().getUsername());
      }
      if(invitation != null) {
        newText = StringUtils.replace(newText, "${invitation.link}", template.getInviteLink() + invitation.getCode());
        newText = StringUtils.replace(newText, "${invitation.username}", invitation.getUser().getUsername());
      }
      return newText;
    }

  }

}
