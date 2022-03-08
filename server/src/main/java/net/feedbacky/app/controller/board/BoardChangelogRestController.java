package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PatchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PostChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.reaction.FetchChangelogReactionDto;
import net.feedbacky.app.data.board.dto.changelog.reaction.PostChangelogReactionDto;
import net.feedbacky.app.service.board.changelog.BoardChangelogService;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestParamsParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 28.03.2021
 */
@RestController
@CrossOrigin
public class BoardChangelogRestController {

  private final BoardChangelogService boardChangelogService;

  @Autowired
  public BoardChangelogRestController(BoardChangelogService boardChangelogService) {
    this.boardChangelogService = boardChangelogService;
  }

  @GetMapping("v1/boards/{discriminator}/changelogs")
  public PaginableRequest<List<FetchChangelogDto>> getAll(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    BoardChangelogService.SortType sortType = BoardChangelogService.SortType.NEWEST;
    if(requestParams.containsKey("sort")) {
      try {
        sortType = BoardChangelogService.SortType.valueOf(requestParams.get("sort").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    if(requestParams.containsKey("query")) {
      return boardChangelogService.getAllChangelogsContaining(discriminator, parser.getPage(), parser.getPageSize(), requestParams.get("query"), sortType);
    }
    return boardChangelogService.getAll(discriminator, parser.getPage(), parser.getPageSize(), sortType);
  }

  @PostMapping("v1/boards/{discriminator}/changelogs")
  public ResponseEntity<FetchChangelogDto> post(@PathVariable String discriminator, @Valid @RequestBody PostChangelogDto dto) {
    return boardChangelogService.post(discriminator, dto);
  }

  @PostMapping("v1/changelogs/{id}/reactions")
  public FetchChangelogReactionDto postReaction(@PathVariable long id, @Valid @RequestBody PostChangelogReactionDto dto) {
    return boardChangelogService.postReaction(id, dto);
  }

  @PatchMapping("v1/changelogs/{id}")
  public FetchChangelogDto patch(@PathVariable long id, @Valid @RequestBody PatchChangelogDto dto) {
    return boardChangelogService.patch(id, dto);
  }

  @DeleteMapping("v1/changelogs/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return boardChangelogService.delete(id);
  }

  @DeleteMapping("v1/changelogs/{id}/reactions/{reactionId}")
  public ResponseEntity deleteReaction(@PathVariable long id, @PathVariable String reactionId) {
    return boardChangelogService.deleteReaction(id, reactionId);
  }


}
