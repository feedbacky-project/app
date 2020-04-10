package net.feedbacky.app.service.board.featured;

import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.FetchBoardDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@Service
public class FeaturedBoardsServiceImpl implements FeaturedBoardsService {

  private List<Long> featuredBoards = new ArrayList<>();
  private BoardRepository boardRepository;

  @Autowired
  public FeaturedBoardsServiceImpl(BoardRepository boardRepository) {
    this.boardRepository = boardRepository;
  }

  @Scheduled(fixedDelay = 86_400_000)
  public void scheduleFeaturedBoardsSelectionTask() {
    featuredBoards.clear();
    List<Board> boards = boardRepository.findByPrivatePageFalse();
    Collections.shuffle(boards);
    int i = 6;
    for(Board board : boards) {
      featuredBoards.add(board.getId());
      i--;
      if(i <= 0) {
        return;
      }
    }
  }

  @Override
  public List<FetchBoardDto> getAll() {
    List<FetchBoardDto> boards = new ArrayList<>();
    for(Long id : featuredBoards) {
      Optional<Board> board = boardRepository.findById(id);
      //someone deleted board, reschedule and load again.
      if(!board.isPresent()) {
        scheduleFeaturedBoardsSelectionTask();
        return getAll();
      }
      boards.add(board.get().convertToDto().ensureViewExplicit());
    }
    return boards;
  }
}
