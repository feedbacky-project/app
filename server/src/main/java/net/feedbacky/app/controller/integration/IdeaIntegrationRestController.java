package net.feedbacky.app.controller.integration;

import net.feedbacky.app.service.idea.integration.IdeaIntegrationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@CrossOrigin
@RestController
public class IdeaIntegrationRestController {

  private final IdeaIntegrationService integrationService;

  @Autowired
  public IdeaIntegrationRestController(IdeaIntegrationService integrationService) {
    this.integrationService = integrationService;
  }

  @PatchMapping("v1/ideas/{id}/github/convert")
  public ResponseEntity postGitHubIdeaToIssue(@PathVariable long id) {
    return integrationService.postGitHubIdeaToIssue(id);
  }

}
