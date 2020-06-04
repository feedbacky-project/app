package net.feedbacky.app.util;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Plajer
 * <p>
 * Created at 24.10.2019
 */
public class Base64Util {

  private Base64Util() {
  }

  public static double calculateBase64DataSizeInKb(String base64String) {
    double result = -1.0;
    if(StringUtils.isNotEmpty(base64String)) {
      int padding = 0;
      if(base64String.endsWith("==")) {
        padding = 2;
      } else {
        if(base64String.endsWith("=")) {
          padding = 1;
        }
      }
      result = (Math.ceil(base64String.length() / 4) * 3) - padding;
    }
    return result / 1000;
  }

  public static String extractMimeType(final String encoded) {
    final Pattern mime = Pattern.compile("^data:([a-zA-Z0-9]+/[a-zA-Z0-9-]+).*,.*");
    final Matcher matcher = mime.matcher(encoded);
    if(!matcher.find()) {
      return "";
    }
    return matcher.group(1).toLowerCase();
  }

  public static String extractBase64Data(String encoded) {
    return encoded.split(";base64,")[1];
  }

  public enum ImageType {
    BANNER("projects/banners", "png", 1120, 400),
    LOGO("projects/logos", "png", 100, 100),
    ATTACHMENT("attachments", "png", -1, -1),
    SOCIAL_ICON("projects/social", "png", 32, 32);

    private final String name;
    private final String extension;
    private final int width;
    private final int height;

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
