package net.feedbacky.app.utils.imagecompress;

import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.utils.Constants;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 18.12.2019
 */
@Component
public class CheetahoCompressor implements Compressor {

  private String apiKey = System.getenv("SERVER_IMAGE_COMPRESSION_CHEETAHO_API_KEY");
  private String baseUrl = "http://api.cheetaho.com/api/v1/media";

  @Override
  public void compressFile(String localPath) {
    try {
      doCompressFile(localPath);
    } catch(IOException | UnirestException e) {
      Logger.getAnonymousLogger().log(Level.SEVERE, "Cheetaho compression failed.");
      e.printStackTrace();
    }
  }

  private void doCompressFile(String localPath) throws IOException, UnirestException {
    ObjectMapper mapper = new ObjectMapper();
    ObjectNode node = mapper.createObjectNode();
    node.put("key", apiKey);
    node.put("url", Constants.IMAGE_HOST + localPath);
    node.put("lossy", 0);
    HttpResponse<JsonNode> request = Unirest.post(baseUrl)
            .header("Content-Type", "application/json")
            .body(mapper.writeValueAsString(node))
            .asJson();

    if(request.getStatus() == HttpStatus.OK.value()) {
      try(InputStream in = new URL(request.getBody().getObject().getJSONObject("data").getString("destURL")).openStream()) {
        Files.copy(in, Paths.get("storage-data/" + localPath), StandardCopyOption.REPLACE_EXISTING);
      }
    } else {
      switch(request.getStatus()) {
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
