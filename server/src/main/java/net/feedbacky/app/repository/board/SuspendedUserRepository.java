package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.suspended.SuspendedUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 27.11.2020
 */
@Repository
public interface SuspendedUserRepository extends JpaRepository<SuspendedUser, Long> {

  List<SuspendedUser> findByBoard(Board board);

}
