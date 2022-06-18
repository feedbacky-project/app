package net.feedbacky.app.service.board.integration;

import net.feedbacky.app.data.board.dto.integration.FetchGithubIssue;
import net.feedbacky.app.data.board.dto.integration.FetchIntegrationDto;
import net.feedbacky.app.data.board.dto.integration.PatchIntegrationDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
public interface IntegrationService {

  List<FetchGithubIssue> getListedGitHubIssues(String discriminator);

  FetchIntegrationDto patchIntegrationData(long id, PatchIntegrationDto dto);

  ResponseEntity delete(long id);

}
