package net.feedbacky.app.util.mailservice;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.invite.Invitation;
import net.feedbacky.app.rest.data.user.User;

import org.apache.commons.lang3.StringUtils;

/**
 * @author Plajer
 * <p>
 * Created at 09.04.2020
 */
public class MailPlaceholderParser {

  private MailPlaceholderParser() {
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
