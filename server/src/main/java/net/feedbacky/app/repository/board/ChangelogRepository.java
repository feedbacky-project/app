package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;
import net.feedbacky.app.data.idea.Idea;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphPagingAndSortingRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Repository
public interface ChangelogRepository extends EntityGraphPagingAndSortingRepository<Changelog, Long> {

  Page<Changelog> findByBoard(Board board, Pageable pageable);

  @EntityGraph(value = "Idea.fetch")
  @Query("SELECT c FROM Changelog c WHERE c.board = ?1 AND (c.title LIKE %?2% OR c.description LIKE %?2%)")
  Page<Changelog> findByQuery(Board board, String query, Pageable pageable);

}
