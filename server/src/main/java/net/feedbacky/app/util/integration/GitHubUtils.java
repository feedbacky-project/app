package net.feedbacky.app.util.integration;

import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.exception.FeedbackyRestException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;
import org.kohsuke.github.GitHubBuilder;
import org.springframework.http.HttpStatus;

import java.io.IOException;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
public class GitHubUtils {

  private GitHubUtils() {
  }

  public static GHRepository getRepoFromIntegration(Integration integration) throws IOException {
    if(integration.getData().equals("")) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub Integration not yet enabled.");
    }
    JsonObject json = new Gson().fromJson(integration.getData(), JsonObject.class);
    if(!json.get("enabled").getAsBoolean()) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "GitHub Integration not yet enabled.");
    }
    GitHub gitHub = new GitHubBuilder().withAppInstallationToken(integration.getApiKey()).build();
    try {
      gitHub.checkApiUrlValidity();
    } catch(IOException e) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Integration API Key is invalid, please recreate GitHub Integration.");
    }
    return gitHub.getRepository(json.get("repository").getAsString());
  }

}
