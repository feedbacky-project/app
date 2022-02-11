package net.feedbacky.app.util.request;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.types.InsufficientPermissionsException;

/**
 * @author Plajer
 * <p>
 * Created at 26.02.2021
 */
public class ServiceValidator {

  private ServiceValidator() {
  }

  public static void isPermitted(Board board, Moderator.Role role, User user) {
    isPermitted(board, role, user, "Insufficient permissions.");
  }

  public static void isPermitted(Board board, Moderator.Role role, User user, String reason) {
    if(!hasPermission(board, role, user)) {
      throw new InsufficientPermissionsException(reason);
    }
  }

  public static boolean hasPermission(Board board, Moderator.Role role, User user) {
    for (Moderator modNode : user.getPermissions()) {
      if (modNode.getBoard().equals(board)) {
        return modNode.getRole().getId() <= role.getId();
      }
    }
    return false;
  }


}
