package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.roadmap.FetchRoadmapElement;
import net.feedbacky.app.service.board.roadmap.RoadmapService;

import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@CrossOrigin
@RestController
public class BoardRoadmapRestController {

  private RoadmapService roadmapService;

  @Autowired
  public BoardRoadmapRestController(RoadmapService roadmapService) {
    this.roadmapService = roadmapService;
  }

  @GetMapping("v1/boards/{discriminator}/roadmap")
  public List<FetchRoadmapElement> getAll(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
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
    return roadmapService.getAll(discriminator, page, pageSize);
  }

}
