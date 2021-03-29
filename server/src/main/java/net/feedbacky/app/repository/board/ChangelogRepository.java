package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.changelog.Changelog;

import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphPagingAndSortingRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@Repository
public interface ChangelogRepository extends EntityGraphPagingAndSortingRepository<Changelog, Long> {

  Page<Changelog> findByBoard(Board board, Pageable pageable);

}
