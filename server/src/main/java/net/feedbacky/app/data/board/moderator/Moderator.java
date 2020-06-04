package net.feedbacky.app.data.board.moderator;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.moderator.FetchModeratorDto;
import net.feedbacky.app.data.board.dto.moderator.FetchUserPermissionDto;
import net.feedbacky.app.data.user.User;

import org.modelmapper.ModelMapper;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Entity
@Table(name = "boards_moderators")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Moderator implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @ManyToOne
  @JoinColumn(name = "board_id")
  private Board board;
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;
  private Role role;

  public FetchModeratorDto convertToModeratorDto() {
    FetchModeratorDto dto = new ModelMapper().map(this, FetchModeratorDto.class);
    dto.setUser(user.convertToDto().exposeSensitiveData(false).convertToSimpleDto());
    dto.setUserId(user.getId());
    return dto;
  }

  public FetchUserPermissionDto convertToUserPermissionDto() {
    FetchUserPermissionDto dto = new ModelMapper().map(this, FetchUserPermissionDto.class);
    dto.setBoardDiscriminator(board.getDiscriminator());
    dto.setBoardName(board.getName());
    return dto;
  }

  public enum Role {
    USER(3), MODERATOR(2),
    @Deprecated //shouldn't be used anymore
    ADMINISTRATOR(1), OWNER(0);

    private final int id;

    Role(int id) {
      this.id = id;
    }

    public int getId() {
      return id;
    }
  }
}
