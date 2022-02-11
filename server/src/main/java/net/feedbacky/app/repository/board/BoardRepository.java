package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraph;
import com.cosium.spring.data.jpa.entity.graph.repository.EntityGraphJpaRepository;

import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Repository @Table
public interface BoardRepository extends EntityGraphJpaRepository<Board, Long> {

  Optional<Board> findByDiscriminator(String discriminator);

  Optional<Board> findByDiscriminator(String discriminator, EntityGraph graph);

}
