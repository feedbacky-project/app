package net.feedbacky.app.util.objectstorage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.util.Constants;
import net.feedbacky.app.util.imagecompress.ImageCompressor;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@Component
public class ObjectStorage {

  private final ImageCompressor imageCompressor;

  @Autowired
  public ObjectStorage(ImageCompressor imageCompressor) {
    this.imageCompressor = imageCompressor;
  }

  public byte[] getImageFromUrl(String url) throws IOException {
    String path = url.replace(Constants.IMAGE_HOST, "");
    File file = new File(path);
    return IOUtils.toByteArray(file.toURI());
  }

  public String storeImage(String encoded, ImageType type) {
    try {
      byte[] data = Base64.getDecoder().decode(encoded);
      ByteArrayInputStream bis = new ByteArrayInputStream(data);
      BufferedImage img = ImageIO.read(bis);
      if(type.getMode() != null) {
        img = Scalr.resize(img, Scalr.Method.ULTRA_QUALITY, type.getMode(), type.getWidth(), type.getHeight(), Scalr.OP_ANTIALIAS);
      }
      UUID uuid = UUID.randomUUID();
      String path = type.getPath() + File.separator + uuid.toString() + ".png";
      File output = new File("storage-data" + File.separator + path);
      output.mkdirs();
      ImageIO.write(img, "png", output);
      imageCompressor.getCompressor().compressFile(path);
      return Constants.IMAGE_HOST + path;
    } catch(IOException ex) {
      ex.printStackTrace();
      return "";
    }
  }

  /**
   * Removes file of target path.
   *
   * @param path path to file to remove it
   * @return true if removed successfully, false if it's default image (from cdn.feedbacky.net) or if fails.
   */
  public boolean deleteImage(String path) {
    if(path.contains("cdn.feedbacky.net")) {
      return false;
    }
    String filePath = StringUtils.remove(path, Constants.IMAGE_HOST);
    File target = new File("storage-data" + File.separator + filePath);
    return target.delete();
  }

  @AllArgsConstructor
  @Getter
  public enum ImageType {
    ATTACHMENT(null, -1, -1, "attachments"), PROJECT_BANNER(Scalr.Mode.FIT_TO_WIDTH, 1120, 400, "projects/banners"),
    PROJECT_LOGO(Scalr.Mode.FIT_TO_WIDTH, 100, 100, "projects/logos"), PROJECT_SOCIAL_ICON(Scalr.Mode.FIT_EXACT, 32, 32, "projects/social");

    private Scalr.Mode mode;
    private int width;
    private int height;
    private String path;

  }

}
