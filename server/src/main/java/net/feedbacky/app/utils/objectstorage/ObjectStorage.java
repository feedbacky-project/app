package net.feedbacky.app.utils.objectstorage;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.social.SocialLink;
import net.feedbacky.app.rest.data.idea.Idea;
import net.feedbacky.app.rest.data.idea.attachment.Attachment;
import net.feedbacky.app.utils.Base64Utils;
import net.feedbacky.app.utils.Constants;
import net.feedbacky.app.utils.ImageUtils;
import net.feedbacky.app.utils.imagecompress.CheetahoCompressor;
import net.feedbacky.app.utils.imagecompress.ImageCompressor;

import org.apache.commons.lang3.RandomStringUtils;
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
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 18.12.2019
 */
@Component
//todo recode required
@Deprecated
public class ObjectStorage {

  private ImageCompressor imageCompressor;

  @Autowired
  public ObjectStorage(ImageCompressor imageCompressor) {
    this.imageCompressor = imageCompressor;
  }

  public String storeEncodedAttachment(Idea idea, Base64Utils.ImageType type, String encoded) throws IOException {
    byte[] data = Base64.getDecoder().decode(encoded);
    ByteArrayInputStream bis = new ByteArrayInputStream(data);
    BufferedImage img = ImageIO.read(bis);

    String fileName = idea.getId() + "_" + RandomStringUtils.randomAlphanumeric(6);
    String path = type.getName() + File.separator + fileName + "." + type.getExtension();
    File output = new File("storage-data" + File.separator + path);
    output.mkdirs();
    ImageIO.write(img, "png", output);
    try {
      imageCompressor.getCompressor().compressFile(path);
      return Constants.IMAGE_HOST + path;
    } catch(Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  public String storeEncodedImage(Board board, Base64Utils.ImageType type, String encoded) throws IOException {
    byte[] data = Base64.getDecoder().decode(encoded);
    ByteArrayInputStream bis = new ByteArrayInputStream(data);
    BufferedImage img = ImageIO.read(bis);
    BufferedImage newImg = img;
    if(type != Base64Utils.ImageType.ATTACHMENT) {
      if(type == Base64Utils.ImageType.SOCIAL_ICON) {
        newImg = Scalr.resize(img, Scalr.Method.ULTRA_QUALITY, Scalr.Mode.FIT_EXACT, type.getWidth(), type.getHeight(), Scalr.OP_ANTIALIAS);
      } else {
        newImg = Scalr.resize(img, Scalr.Method.ULTRA_QUALITY, Scalr.Mode.FIT_TO_WIDTH, type.getWidth(), type.getHeight(), Scalr.OP_ANTIALIAS);
      }
    }

    String fileName = board.getId() + "_" + RandomStringUtils.randomAlphanumeric(6);
    String path = type.getName() + File.separator + fileName + "." + type.getExtension();

    File output = new File("storage-data" + File.separator + path);
    output.mkdirs();
    ImageIO.write(newImg, "png", output);
    try {
      imageCompressor.getCompressor().compressFile(path);
      return Constants.IMAGE_HOST + path;
    } catch(Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  public void deleteSocialIcon(SocialLink link) {
    if(Constants.DEFAULT_ICONS.containsValue(link.getLogoUrl())) {
      return;
    }
    String path = StringUtils.remove(link.getLogoUrl(), "https://cdn.feedbacky.net/");
    File target = new File("storage-data" + File.separator + path);
    if(!target.delete()) {
      Logger.getLogger("Failed to delete file with path " + path);
    }
  }

  public void deleteAttachment(Attachment attachment) {
    String path = StringUtils.remove(attachment.getUrl(), "https://cdn.feedbacky.net/");
    File target = new File("storage-data" + File.separator + path);
    if(!target.delete()) {
      Logger.getLogger("Failed to delete file with path " + path);
    }
  }

  public void deleteImage(Board board, Base64Utils.ImageType type) {
    String url = "";
    switch(type) {
      case BANNER:
        url = board.getBanner();
        break;
      case LOGO:
        url = board.getLogo();
        break;
    }
    if(url.equals(ImageUtils.DEFAULT_LOGO_URL) || url.equals(ImageUtils.DEFAULT_BANNER_URL)) {
      return;
    }
    String path = StringUtils.remove(url, "https://cdn.feedbacky.net/");
    File target = new File("storage-data" + File.separator + path);
    if(!target.delete()) {
      Logger.getLogger("Failed to delete file with path " + path);
    }
  }

}
