package net.feedbacky.app.util;

import lombok.SneakyThrows;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * @author Plajer
 * <p>
 * Created at 10.01.2021
 */
public class FileResourceUtils {

  private FileResourceUtils() {
  }

  @SneakyThrows
  public static String readFileContents(String filePath) {
    Resource resource = new ClassPathResource(filePath);
    InputStream inputStream = resource.getInputStream();
    StringBuilder contentBuilder = new StringBuilder();
    try(BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
      for(String line; (line = br.readLine()) != null;) {
        contentBuilder.append(line).append("\n");
      }
    }
    return contentBuilder.toString();
  }

}
