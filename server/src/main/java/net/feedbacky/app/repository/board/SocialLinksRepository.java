package net.feedbacky.app.repository.board;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.social.SocialLink;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Repository @Table
public interface SocialLinksRepository extends JpaRepository<SocialLink, Long> {

  List<SocialLink> findByBoard(Board board);

}
