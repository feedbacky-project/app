package net.feedbacky.app.controller.integration;

import net.feedbacky.app.data.board.dto.integration.FetchGithubIssue;
import net.feedbacky.app.data.board.dto.integration.FetchIntegrationDto;
import net.feedbacky.app.data.board.dto.integration.PatchIntegrationDto;
import net.feedbacky.app.service.board.integration.IntegrationServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@CrossOrigin
@RestController
public class IntegrationRestController {

  private final IntegrationServiceImpl integrationService;

  @Autowired
  public IntegrationRestController(IntegrationServiceImpl integrationService) {
    this.integrationService = integrationService;
  }

  @GetMapping("v1/boards/{discriminator}/integrations/github/listedIssues")
  public List<FetchGithubIssue> getLinkableIssues(@PathVariable String discriminator) {
    return integrationService.getListedGitHubIssues(discriminator);
  }

  @PatchMapping("v1/integrations/{id}")
  public FetchIntegrationDto patchIntegrationData(@PathVariable long id, @Valid @RequestBody PatchIntegrationDto dto) {
    return integrationService.patchIntegrationData(id, dto);
  }

  @DeleteMapping("v1/integrations/{id}")
  public ResponseEntity delete(@PathVariable long id) {
    return integrationService.delete(id);
  }

}
