package net.feedbacky.app.service.board.featured;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
public interface FeaturedBoardsService {

  List<FetchBoardDto> getAll();

}
