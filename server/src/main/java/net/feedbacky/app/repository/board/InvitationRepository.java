package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.user.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Repository @Table
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

  List<Invitation> findByBoard(Board board);

  Optional<Invitation> findByBoardAndUser(Board board, User user);

  Optional<Invitation> findByCode(String code);

}
