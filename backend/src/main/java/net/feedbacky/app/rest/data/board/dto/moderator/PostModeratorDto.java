package net.feedbacky.app.rest.data.board.dto.moderator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.rest.data.board.moderator.Moderator;

import org.modelmapper.ModelMapper;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.user.User;

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

  @NotNull(message = "Field 'userId' cannot be null.")
  private long userId;
  @NotNull(message = "Field 'role' cannot be null.")
  @EnumValue(enumClazz = Moderator.Role.class, message = "Field 'role' must be valid role type.")
  private Moderator.Role role;

  public Moderator convertToEntity(User user, Board board) {
    Moderator moderator = new ModelMapper().map(this, Moderator.class);
    moderator.setBoard(board);
    moderator.setUser(user);
    return moderator;
  }

}
