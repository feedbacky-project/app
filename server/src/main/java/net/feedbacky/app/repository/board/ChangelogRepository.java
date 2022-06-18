package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphPagingAndSortingRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Repository
public interface ChangelogRepository extends EntityGraphPagingAndSortingRepository<Changelog, Long> {

  @EntityGraph(value = "Changelog.fetch")
  Optional<Page<Changelog>> findByBoardDiscriminator(String discriminator, Pageable pageable);

  @EntityGraph(value = "Changelog.fetch")
  @Query("SELECT c FROM Changelog c WHERE c.board.discriminator = ?1 AND (c.title LIKE %?2% OR c.description LIKE %?2%)")
  Optional<Page<Changelog>> findByQuery(String discriminator, String query, Pageable pageable);

}
