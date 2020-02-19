package net.feedbacky.app.service.board.featured;

import java.util.List;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
public interface FeaturedBoardsService {

  List<FetchBoardDto> getAll();

}
