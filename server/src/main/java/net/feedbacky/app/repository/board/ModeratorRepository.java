package net.feedbacky.app.repository.board;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.moderator.Moderator;
import net.feedbacky.app.rest.data.user.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 04.12.2019
 */
@Repository
public interface ModeratorRepository extends JpaRepository<Moderator, Long> {

  List<Moderator> findByUser(User user);

  List<Moderator> findByBoard(Board board);

}
