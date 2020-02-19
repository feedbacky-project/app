package net.feedbacky.app.repository.board;

import java.util.List;
import java.util.Optional;

import net.feedbacky.app.rest.data.board.invite.Invitation;
import net.feedbacky.app.rest.data.user.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.feedbacky.app.rest.data.board.Board;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {

  List<Invitation> findByBoard(Board board);

  Optional<Invitation> findByBoardAndUser(Board board, User user);

  Optional<Invitation> findByCode(String code);

}
