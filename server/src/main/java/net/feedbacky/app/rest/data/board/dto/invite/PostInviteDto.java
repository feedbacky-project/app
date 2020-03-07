package net.feedbacky.app.rest.data.board.dto.invite;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.invite.Invitation;
import net.feedbacky.app.rest.data.user.User;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.apache.commons.lang3.RandomStringUtils;
import org.modelmapper.ModelMapper;

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

  @NotNull(message = "Field 'userEmail' cannot be null.")
  private String userEmail;

  public Invitation convertToEntity(User user, Board board) {
    Invitation invitation = new ModelMapper().map(this, Invitation.class);
    invitation.setUser(user);
    invitation.setBoard(board);
    invitation.setCode(user.getId() + "_" + RandomStringUtils.randomAlphabetic(10));
    return invitation;
  }

  public Invitation convertToEntity(User user, Board board, String codeData) {
    Invitation invitation = new ModelMapper().map(this, Invitation.class);
    invitation.setUser(user);
    invitation.setBoard(board);
    invitation.setCode(user.getId() + "_" + codeData + "_" + RandomStringUtils.randomAlphabetic(10));
    return invitation;
  }

}
