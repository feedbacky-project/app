package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.changelog.FetchChangelogDto;
import net.feedbacky.app.data.board.dto.changelog.PostChangelogDto;
import net.feedbacky.app.data.board.dto.social.FetchSocialLinkDto;
import net.feedbacky.app.data.board.dto.social.PostSocialLinkDto;
import net.feedbacky.app.service.board.changelog.BoardChangelogService;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestParamsParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

  @GetMapping("v1/boards/{discriminator}/changelog")
  public PaginableRequest<List<FetchChangelogDto>> getAll(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    return boardChangelogService.getAll(discriminator, parser.getPage(), parser.getPageSize());
  }

  @PostMapping("v1/boards/{discriminator}/changelog")
  public ResponseEntity<FetchChangelogDto> post(@PathVariable String discriminator, @Valid @RequestBody PostChangelogDto dto) {
    return boardChangelogService.post(discriminator, dto);
  }

  @DeleteMapping("v1/changelog/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return boardChangelogService.delete(id);
  }

}
