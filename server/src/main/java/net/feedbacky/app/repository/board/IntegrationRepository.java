package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.integration.Integration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.persistence.Table;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Repository @Table
public interface IntegrationRepository extends JpaRepository<Integration, Long> {

  List<Integration> findByBoard(Board board);

}
