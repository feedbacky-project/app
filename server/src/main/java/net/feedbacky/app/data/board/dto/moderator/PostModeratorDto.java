package net.feedbacky.app.data.board.dto.moderator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@NotNull
public class PostModeratorDto {

  @NotNull(message = "User id cannot be empty.")
  private long userId;
  @NotNull(message = "Role cannot be empty.")
  @EnumValue(enumClazz = Moderator.Role.class, message = "Role must be valid role type.")
  private Moderator.Role role;

  public Moderator convertToEntity(User user, Board board) {
    Moderator moderator = new Moderator();
    moderator.setRole(role);
    moderator.setBoard(board);
    moderator.setUser(user);
    return moderator;
  }

}
