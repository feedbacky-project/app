package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.webhook.Webhook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Repository @Table
public interface WebhookRepository extends JpaRepository<Webhook, Long> {

  Optional<Webhook> findByUrl(String url);

  List<Webhook> findByBoard(Board board);

}
