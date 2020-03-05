package net.feedbacky.app.utils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

/**
 * @author Plajer
 * <p>
 * Created at 24.10.2019
 */
@Component
//todo this class can be with static methods
public class Base64Utils {

  public double calculateBase64DataSizeInKb(String base64String) {
    double result = -1.0;
    if (StringUtils.isNotEmpty(base64String)) {
      int padding = 0;
      if (base64String.endsWith("==")) {
        padding = 2;
      } else {
        if (base64String.endsWith("=")) { padding = 1; }
      }
      result = (Math.ceil(base64String.length() / 4) * 3) - padding;
    }
    return result / 1000;
  }

  public String extractMimeType(final String encoded) {
    final Pattern mime = Pattern.compile("^data:([a-zA-Z0-9]+/[a-zA-Z0-9-]+).*,.*");
    final Matcher matcher = mime.matcher(encoded);
    if (!matcher.find()) {
      return "";
    }
    return matcher.group(1).toLowerCase();
  }

  public String extractBase64Data(String encoded) {
    return encoded.split(";base64,")[1];
  }

  public enum ImageType {
    BANNER("banners", "png", 1120, 400), LOGO("logos", "png", 100, 100),
    ATTACHMENT("attachments", "png", -1, -1), SOCIAL_ICON("social", "png", 32, 32);

    private String name;
    private String extension;
    private int width;
    private int height;

    ImageType(String name, String extension, int width, int height) {
      this.name = name;
      this.extension = extension;
      this.width = width;
      this.height = height;
    }

    public String getName() {
      return name;
    }

    public String getExtension() {
      return extension;
    }

    public int getWidth() {
      return width;
    }

    public int getHeight() {
      return height;
    }
  }

}
