package net.feedbacky.app.repository.idea;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Repository
public interface IdeaRepository extends JpaRepository<Idea, Long> {

  List<Idea> findByBoard(Board board);

  Page<Idea> findByBoard(Board board, Pageable pageable);

  Page<Idea> findByBoardAndStatus(Board board, Idea.IdeaStatus status, Pageable pageable);

  Optional<Idea> findByTitleAndBoard(String title, Board board);

  Page<Idea> findByBoardAndTitleIgnoreCaseContaining(Board board, String title, Pageable pageable);

  Page<Idea> findByBoardAndTagsInAndStatus(Board board, List<Tag> tags, Idea.IdeaStatus status, Pageable pageable);

}
