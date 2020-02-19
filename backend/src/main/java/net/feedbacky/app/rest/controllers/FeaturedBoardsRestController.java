package net.feedbacky.app.rest.controllers;

import java.util.List;

import net.feedbacky.app.service.board.featured.FeaturedBoardsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import net.feedbacky.app.rest.data.board.dto.FetchBoardDto;

/**
 * @author Plajer
 * <p>
 * Created at 02.11.2019
 */
@CrossOrigin
@RestController
public class FeaturedBoardsRestController {

  @Autowired private FeaturedBoardsService featuredBoardsService;

  @GetMapping("v1/featured_boards")
  public List<FetchBoardDto> getAll() {
    return featuredBoardsService.getAll();
  }

}
