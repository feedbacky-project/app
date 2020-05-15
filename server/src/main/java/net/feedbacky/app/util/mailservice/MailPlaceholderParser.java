package net.feedbacky.app.util.mailservice;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.user.User;

import org.apache.commons.lang3.StringUtils;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
public class MailPlaceholderParser {

  private MailPlaceholderParser() {
  }

  public static String parseSubscribeStatusPlaceholder(String text, Idea idea, String status) {
      String parsedText = text;
      parsedText = StringUtils.replace(parsedText, "${idea.viewLink}", MailService.HOST_ADDRESS + "/i/" + idea.getId());
      parsedText = StringUtils.replace(parsedText, "${idea.name}", idea.getTitle());
      parsedText = StringUtils.replace(parsedText, "${status.change}", status);
      return parsedText;
  }

  public static String parseAllAvailablePlaceholders(String text, MailService.EmailTemplate template, Board board, User user, Invitation invitation) {
    String parsedText = text;
    if(board != null) {
      parsedText = parseBoardPlaceholders(parsedText, board);
    }
    if(user != null) {
      parsedText = parseUserPlaceholders(parsedText, user);
    }
    if(invitation != null) {
      parsedText = parseInvitationPlaceholders(parsedText, template, invitation);
    }
    return parsedText;
  }

  public static String parseBoardPlaceholders(String text, Board board) {
    String parsedText = text;
    parsedText = StringUtils.replace(parsedText, "${board.logo}", board.getBanner());
    parsedText = StringUtils.replace(parsedText, "${board.name}", board.getName());
    parsedText = StringUtils.replace(parsedText, "${board.owner}", board.getCreator().getUsername());
    parsedText = StringUtils.replace(parsedText, "${host.address}", MailService.HOST_ADDRESS);
    return parsedText;
  }

  public static String parseUserPlaceholders(String text, User user) {
    String parsedText = text;
    parsedText = StringUtils.replace(parsedText, "${username}", user.getUsername());
    parsedText = StringUtils.replace(parsedText, "${unsubscribe_link}", MailService.HOST_ADDRESS + "/unsubscribe/" + user.getId() + "/" + user.getMailPreferences().getUnsubscribeToken());
    parsedText = StringUtils.replace(parsedText, "${host.address}", MailService.HOST_ADDRESS);
    return parsedText;
  }

  public static String parseInvitationPlaceholders(String text, MailService.EmailTemplate template, Invitation invitation) {
    String parsedText = text;
    parsedText = StringUtils.replace(parsedText, "${invite.link}", template.getInviteLink() + invitation.getCode());
    parsedText = StringUtils.replace(parsedText, "${invite.username}", invitation.getUser().getUsername());
    parsedText = StringUtils.replace(parsedText, "${host.address}", MailService.HOST_ADDRESS);
    return parsedText;
  }

}
