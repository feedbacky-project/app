package net.feedbacky.app.data.board.dto.invite;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.user.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.apache.commons.lang3.RandomStringUtils;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostInviteDto {

  @NotNull(message = "User email cannot be empty.")
  private String userEmail;

  public Invitation convertToEntity(User user, Board board, String codeData) {
    Invitation invitation = new Invitation();
    invitation.setUser(user);
    invitation.setBoard(board);
    invitation.setCode(user.getId() + "_" + codeData + "_" + RandomStringUtils.randomAlphabetic(10));
    return invitation;
  }

}
