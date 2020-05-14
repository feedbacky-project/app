package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PatchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.tag.dto.PatchTagRequestDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.idea.IdeaService;
import net.feedbacky.app.util.PaginableRequest;

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
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 08.10.2019
 */
@CrossOrigin
@RestController
public class IdeaRestController {

  @Autowired private IdeaService ideaService;

  @GetMapping("v1/boards/{discriminator}/ideas")
  public PaginableRequest<List<FetchIdeaDto>> getAllIdeas(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
    //todo can it be shorter
    int page = 0;
    if(requestParams.containsKey("page") && NumberUtils.isDigits(requestParams.get("page"))) {
      page = Integer.parseInt(requestParams.get("page"));
      if(page < 0) {
        page = 0;
      }
    }
    int pageSize = 20;
    if(requestParams.containsKey("pageSize") && NumberUtils.isDigits(requestParams.get("pageSize"))) {
      pageSize = Integer.parseInt(requestParams.get("pageSize"));
      if(pageSize < 1) {
        pageSize = 1;
      }
    }
    if(requestParams.containsKey("query")) {
      return ideaService.getAllIdeasContaining(discriminator, page, pageSize, requestParams.get("query"));
    }
    IdeaService.FilterType filterType = IdeaService.FilterType.OPENED;
    if(requestParams.containsKey("filter")) {
      try {
        filterType = IdeaService.FilterType.valueOf(requestParams.get("filter").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    IdeaService.SortType sortType = IdeaService.SortType.TRENDING;
    if(requestParams.containsKey("sort")) {
      try {
        sortType = IdeaService.SortType.valueOf(requestParams.get("sort").toUpperCase());
      } catch(Exception ignoredInvalid) {
      }
    }
    Logger.getLogger("PERFORMANCE").log(Level.SEVERE, "TEST STARTING");
    long start = System.currentTimeMillis();
    PaginableRequest<List<FetchIdeaDto>> list = ideaService.getAllIdeas(discriminator, page, pageSize, filterType, sortType);
    Logger.getLogger("PERFORMANCE").log(Level.SEVERE, "TEST FINISHED TOOK " + (System.currentTimeMillis() - start) + "ms");
    return list;
  }

  @GetMapping("v1/ideas/{id}")
  public FetchIdeaDto getOne(@PathVariable long id) {
    return ideaService.getOne(id);
  }

  @PostMapping("v1/ideas/")
  public ResponseEntity<FetchIdeaDto> post(@Valid @RequestBody PostIdeaDto dto) {
    return ideaService.post(dto);
  }

  //todo post attachment api

  @PostMapping("v1/ideas/{id}/subscribe")
  public FetchUserDto postSubscribe(@PathVariable long id) {
    return ideaService.postSubscribe(id);
  }

  @PatchMapping("v1/ideas/{id}")
  public FetchIdeaDto patch(@PathVariable long id, @Valid @RequestBody PatchIdeaDto dto) {
    return ideaService.patch(id, dto);
  }

  @DeleteMapping("v1/ideas/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return ideaService.delete(id);
  }

  @DeleteMapping("v1/attachments/{id}")
  public ResponseEntity deleteAttachment(@PathVariable long id) {
    return ideaService.deleteAttachment(id);
  }

  @DeleteMapping("v1/ideas/{id}/subscribe")
  public ResponseEntity deleteSubscribe(@PathVariable long id) {
    return ideaService.deleteSubscribe(id);
  }

  @GetMapping("v1/ideas/{id}/voters")
  public List<FetchUserDto> getAllVoters(@PathVariable long id) {
    return ideaService.getAllVoters(id);
  }

  @PostMapping("v1/ideas/{id}/voters")
  public FetchUserDto postUpvote(@PathVariable long id) {
    return ideaService.postUpvote(id);
  }

  @DeleteMapping("v1/ideas/{id}/voters")
  public ResponseEntity deleteUpvote(@PathVariable long id) {
    return ideaService.deleteUpvote(id);
  }

  @PatchMapping("v1/ideas/{id}/tags")
  public List<FetchTagDto> patchTags(@PathVariable long id, @RequestBody List<PatchTagRequestDto> tags) {
    return ideaService.patchTags(id, tags);
  }

}
