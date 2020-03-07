package net.feedbacky.app.repository.board;

import net.feedbacky.app.rest.data.board.Board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

  Optional<Board> findByDiscriminator(String discriminator);

  List<Board> findByPrivatePageFalse();

}
