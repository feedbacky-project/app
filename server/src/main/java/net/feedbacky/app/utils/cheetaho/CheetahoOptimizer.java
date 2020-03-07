package net.feedbacky.app.utils.cheetaho;

import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.utils.Base64Utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * @author Plajer
 * <p>
 * Created at 18.12.2019
 */
@Component
public class CheetahoOptimizer {

  @Value("${cheetaho.api-key}")
  private String apiKey;
  @Value("${cheetaho.enabled}")
  private boolean enabled;
  private String baseUrl = "http://api.cheetaho.com/api/v1/media";

  public void compressFile(Base64Utils.ImageType type, String id) throws IOException, UnirestException {
    if(!enabled) {
      return;
    }
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("key", apiKey);
    node.put("url", "https://api.feedbacky.net/temp/data/" + type.getName() + "/" + id + "." + type.getExtension());
    node.put("lossy", 0);
    HttpResponse<JsonNode> request = Unirest.post(baseUrl)
        .header("Content-Type", "application/json")
        .body(mapper.writeValueAsString(node))
        .asJson();

    if (request.getStatus() == HttpStatus.OK.value()) {
      try (InputStream in = new URL(request.getBody().getObject().getJSONObject("data").getString("destURL")).openStream()) {
        Files.copy(in, Paths.get(System.getProperty("user.dir").replace("\\", "/") + "/tmp/"
            + type.getName() + "/" + id + "." + type.getExtension()), StandardCopyOption.REPLACE_EXISTING);
      }
    } else {
      switch (request.getStatus()) {
        case 304:
          throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Temporary file not available.");
        case 400:
          throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid image URL.");
        case 401:
          throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid ImageIO API key, contact site administrator.");
        case 403:
          throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "ImageIO quota reached, contact site administrator.");
        case 500:
          throw new FeedbackyRestException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process the image.");
      }
    }
  }

}
