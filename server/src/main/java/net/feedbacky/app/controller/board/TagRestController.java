package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagDto;
import net.feedbacky.app.data.tag.dto.PostTagDto;
import net.feedbacky.app.service.board.tag.TagService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Cretaed at 11.03.2022
 */
@CrossOrigin
@RestController
public class TagRestController {

  private final TagService tagService;

  @Autowired
  public TagRestController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping("v1/boards/{discriminator}/tags")
  public List<FetchTagDto> getAllTags(@PathVariable String discriminator) {
    return tagService.getAllTags(discriminator);
  }

  @GetMapping("v1/boards/{discriminator}/tags/{id}")
  public FetchTagDto getTagById(@PathVariable String discriminator, @PathVariable long id) {
    return tagService.getTagById(discriminator, id);
  }

  @PostMapping("v1/boards/{discriminator}/tags")
  public ResponseEntity<FetchTagDto> postTag(@PathVariable String discriminator, @Valid @RequestBody PostTagDto dto) {
    return tagService.postTag(discriminator, dto);
  }

  @PatchMapping("v1/boards/{discriminator}/tags/{id}")
  public FetchTagDto patchTag(@PathVariable String discriminator, @PathVariable long id, @Valid @RequestBody PatchTagDto dto) {
    return tagService.patchTag(discriminator, id, dto);
  }

  @DeleteMapping("v1/boards/{discriminator}/tags/{id}")
  public ResponseEntity deleteTag(@PathVariable String discriminator, @PathVariable long id) {
    return tagService.deleteTag(discriminator, id);
  }

}
