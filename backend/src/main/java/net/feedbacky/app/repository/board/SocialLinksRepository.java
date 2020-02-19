package net.feedbacky.app.repository.board;

import java.util.List;

import net.feedbacky.app.rest.data.board.social.SocialLink;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.feedbacky.app.rest.data.board.Board;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Repository
public interface SocialLinksRepository extends JpaRepository<SocialLink, Long> {

  List<SocialLink> findByBoard(Board board);

}
