package net.feedbacky.app.repository.board;

import java.util.List;
import java.util.Optional;

import net.feedbacky.app.rest.data.board.webhook.Webhook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.feedbacky.app.rest.data.board.Board;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Repository
public interface WebhookRepository extends JpaRepository<Webhook, Long> {

  Optional<Webhook> findByUrl(String url);

  List<Webhook> findByBoard(Board board);

}
