package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.board.dto.FetchBoardDto;
import net.feedbacky.app.data.board.dto.PatchBoardDto;
import net.feedbacky.app.data.board.dto.PostBoardDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagDto;
import net.feedbacky.app.data.tag.dto.PostTagDto;
import net.feedbacky.app.service.board.BoardService;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.RequestParamsParser;

import org.apache.commons.lang3.math.NumberUtils;
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
 * Created at 10.10.2019
 */
@CrossOrigin
@RestController
public class BoardRestController {

  private final BoardService boardService;

  @Autowired
  public BoardRestController(BoardService boardService) {
    this.boardService = boardService;
  }

  @GetMapping("v1/boards/")
  public PaginableRequest<List<FetchBoardDto>> getAll(@RequestParam Map<String, String> requestParams) {
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    return boardService.getAll(parser.getPage(), parser.getPageSize());
  }

  @PostMapping("v1/boards/")
  public ResponseEntity<FetchBoardDto> post(@Valid @RequestBody PostBoardDto postProjectDto) {
    return boardService.post(postProjectDto);
  }

  @GetMapping("v1/boards/{discriminator}")
  public FetchBoardDto getOne(@PathVariable String discriminator) {
    return boardService.getOne(discriminator);
  }

  @PatchMapping("v1/boards/{discriminator}")
  public FetchBoardDto patch(@PathVariable String discriminator, @Valid @RequestBody PatchBoardDto dto) {
    return boardService.patch(discriminator, dto);
  }

  @DeleteMapping("v1/boards/{discriminator}")
  public ResponseEntity delete(@PathVariable String discriminator) {
    return boardService.delete(discriminator);
  }

  @GetMapping("v1/boards/{discriminator}/tags")
  public List<FetchTagDto> getAllTags(@PathVariable String discriminator) {
    return boardService.getAllTags(discriminator);
  }

  @GetMapping("v1/boards/{discriminator}/tags/{name}")
  public FetchTagDto getTagByName(@PathVariable String discriminator, @PathVariable String name) {
    return boardService.getTagByName(discriminator, name);
  }

  @PostMapping("v1/boards/{discriminator}/tags")
  public ResponseEntity<FetchTagDto> postTag(@PathVariable String discriminator, @Valid @RequestBody PostTagDto dto) {
    return boardService.postTag(discriminator, dto);
  }

  @PatchMapping("v1/boards/{discriminator}/tags/{name}")
  public FetchTagDto patchTag(@PathVariable String discriminator, @PathVariable String name, @Valid @RequestBody PatchTagDto dto) {
    return boardService.patchTag(discriminator, name, dto);
  }

  @DeleteMapping("v1/boards/{discriminator}/tags/{name}")
  public ResponseEntity deleteTag(@PathVariable String discriminator, @PathVariable String name) {
    return boardService.deleteTag(discriminator, name);
  }

}
