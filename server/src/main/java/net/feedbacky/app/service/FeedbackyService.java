package net.feedbacky.app.service;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.moderator.Moderator;
import net.feedbacky.app.rest.data.user.User;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
public interface FeedbackyService {

  default boolean hasPermission(Board board, Moderator.Role role, User user) {
    for (Moderator modNode : user.getPermissions()) {
      if (modNode.getBoard().equals(board)) {
        return modNode.getRole().getId() <= role.getId();
      }
    }
    return false;
  }

}
