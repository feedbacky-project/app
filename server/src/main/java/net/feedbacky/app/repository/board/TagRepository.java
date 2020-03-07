package net.feedbacky.app.repository.board;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.tag.Tag;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 14.10.2019
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

  List<Tag> findByBoard(Board board);

  Optional<Tag> findByBoardAndName(Board board, String name);

}
