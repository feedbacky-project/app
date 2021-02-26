package net.feedbacky.app.controller.board;

import net.feedbacky.app.data.roadmap.FetchRoadmapElement;
import net.feedbacky.app.service.board.roadmap.RoadmapService;
import net.feedbacky.app.util.RequestParamsParser;

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

  private final RoadmapService roadmapService;

  @Autowired
  public BoardRoadmapRestController(RoadmapService roadmapService) {
    this.roadmapService = roadmapService;
  }

  @GetMapping("v1/boards/{discriminator}/roadmap")
  public List<FetchRoadmapElement> getAll(@PathVariable String discriminator, @RequestParam Map<String, String> requestParams) {
    RequestParamsParser parser = new RequestParamsParser(requestParams);
    return roadmapService.getAll(discriminator, parser.getPage(), parser.getPageSize());
  }

}
