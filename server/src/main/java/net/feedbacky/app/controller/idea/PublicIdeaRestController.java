package net.feedbacky.app.controller.idea;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.service.idea.IdeaService;
import net.feedbacky.app.service.idea.PublicIdeaService;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.PublicApiRequest;
import net.feedbacky.app.util.RequestParamsParser;

import org.apache.commons.lang3.math.NumberUtils;
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
 * Created at 19.02.2021
 */
@RestController
@CrossOrigin
public class PublicIdeaRestController {

  private final PublicIdeaService publicIdeaService;

  @Autowired
  public PublicIdeaRestController(PublicIdeaService publicIdeaService) {
    this.publicIdeaService = publicIdeaService;
  }

  @GetMapping("v1/public/boards/{discriminator}/ideas")
  public PublicApiRequest<PaginableRequest<List<FetchIdeaDto>>> getAllIdeas(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
    IdeaService.FilterType filterType = IdeaService.FilterType.OPENED;
    if(requestParams.containsKey("filter")) {
      try {
        String filterName = requestParams.get("filter").toUpperCase();
        String[] filterData = filterName.split(":");
        if(filterData.length == 2 && filterData[0].equals("TAG")) {
          filterType = new IdeaService.FilterType(IdeaService.FilterType.Type.TAG, Long.parseLong(filterData[1]));
        } else {
          filterType = new IdeaService.FilterType(IdeaService.FilterType.Type.valueOf(requestParams.get("filter").toUpperCase()), null);
        }
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
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    return publicIdeaService.getAllIdeas(discriminator, parser.getPage(), parser.getPageSize(), filterType, sortType);
  }

  @GetMapping("v1/public/ideas/{id}")
  public PublicApiRequest<FetchIdeaDto> getOne(@PathVariable long id) {
    return publicIdeaService.getOne(id);
  }

  @PostMapping("v1/public/ideas/")
  public ResponseEntity<PublicApiRequest<FetchIdeaDto>> post(@Valid @RequestBody PostIdeaDto dto) {
    return publicIdeaService.post(dto);
  }

  @PostMapping("v1/public/ideas/{id}/voters")
  public PublicApiRequest<FetchUserDto> postUpvote(@PathVariable long id) {
    return publicIdeaService.postUpvote(id);
  }

  @DeleteMapping("v1/public/ideas/{id}/voters")
  public ResponseEntity<PublicApiRequest<?>> deleteUpvote(@PathVariable long id) {
    return publicIdeaService.deleteUpvote(id);
  }

}