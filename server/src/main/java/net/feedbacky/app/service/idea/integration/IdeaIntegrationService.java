package net.feedbacky.app.service.idea.integration;

import net.feedbacky.app.data.idea.dto.FetchIdeaDto;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
public interface IdeaIntegrationService {

  ResponseEntity postGitHubIdeaToIssue(long id);

  FetchIdeaDto patchGitHubLinkIdeaToIssue(long id, long issueId);

}
