package net.feedbacky.app.data.board.suspended;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.user.User;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 17.11.2020
 */
@Entity
@Table(name = "boards_suspended_users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SuspendedUser implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @ManyToOne
  @JoinColumn(name = "board_id")
  private Board board;
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;
  private Date suspensionEndDate;

}
