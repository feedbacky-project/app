package net.feedbacky.app.rest.controller;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;
import net.feedbacky.app.service.board.featured.FeaturedBoardsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@CrossOrigin
@RestController
public class FeaturedBoardsRestController {

  private FeaturedBoardsService featuredBoardsService;

  @Autowired
  public FeaturedBoardsRestController(FeaturedBoardsService featuredBoardsService) {
    this.featuredBoardsService = featuredBoardsService;
  }

  @GetMapping("v1/featured_boards")
  public List<FetchBoardDto> getAll() {
    return featuredBoardsService.getAll();
  }

}
