package net.feedbacky.app.repository.idea;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphJpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Repository
@Table
public interface IdeaRepository extends EntityGraphJpaRepository<Idea, Long> {

  @EntityGraph(value = "Idea.fetch")
  Page<Idea> findByBoard(Board board, Pageable pageable);

  @EntityGraph(value = "Idea.fetch")
  Page<Idea> findByBoardAndStatus(Board board, Idea.IdeaStatus status, Pageable pageable);

  @EntityGraph(value = "Idea.fetch")
  Optional<Idea> findByTitleAndBoard(String title, Board board);

  @EntityGraph(value = "Idea.fetch")
  Page<Idea> findByBoardAndTitleIgnoreCaseContaining(Board board, String title, Pageable pageable);

  @EntityGraph(value = "Idea.fetch")
  Page<Idea> findByBoardAndTagsIn(Board board, List<Tag> tags, Pageable pageable);

  @EntityGraph(value = "Idea.fetch")
  Page<Idea> findByBoardAndTagsInAndStatus(Board board, List<Tag> tags, Idea.IdeaStatus status, Pageable pageable);

}
