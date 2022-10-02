package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.service.idea.IdeaService;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 08.10.2019
 */
@CrossOrigin
@RestController
public class IdeaRestController {

  private final IdeaService ideaService;

  @Autowired
  public IdeaRestController(IdeaService ideaService) {
    this.ideaService = ideaService;
  }

  @GetMapping("v1/boards/{discriminator}/ideas")
  public PaginableRequest<List<FetchIdeaDto>> getAllExperimental(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams,
                                                                 @RequestHeader(value = "X-Feedbacky-Anonymous-Id", required = false) String anonymousId) {
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    String filter = requestParams.getOrDefault("filter", "");
    IdeaService.SortType sortType = IdeaService.SortType.TRENDING;
    if(requestParams.containsKey("sort")) {
      try {
        sortType = IdeaService.SortType.valueOf(requestParams.get("sort").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    return ideaService.getAllIdeasByFilterQuery(discriminator, parser.getPage(), parser.getPageSize(), filter, sortType, anonymousId);
  }

  @GetMapping("v1/ideas/{id}")
  public FetchIdeaDto getOne(@PathVariable long id, @RequestHeader(value = "X-Feedbacky-Anonymous-Id", required = false) String anonymousId) {
    return ideaService.getOne(id, anonymousId);
  }

  @PostMapping("v1/ideas/")
  public ResponseEntity<FetchIdeaDto> post(@Valid @RequestBody PostIdeaDto dto) {
    return ideaService.post(dto);
  }

  @PatchMapping("v1/ideas/{id}")
  public FetchIdeaDto patch(@PathVariable long id, @Valid @RequestBody PatchIdeaDto dto) {
    return ideaService.patch(id, dto);
  }

  @DeleteMapping("v1/ideas/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return ideaService.delete(id);
  }

  @GetMapping("v1/ideas/{id}/mentionableUsers")
  public List<FetchSimpleUserDto> getAllMentions(@PathVariable long id) {
    return ideaService.getAllMentions(id);
  }

  @PatchMapping("v1/ideas/{id}/tags")
  public List<FetchTagDto> patchTags(@PathVariable long id, @RequestBody List<PatchTagRequestDto> tags) {
    return ideaService.patchTags(id, tags);
  }

}
