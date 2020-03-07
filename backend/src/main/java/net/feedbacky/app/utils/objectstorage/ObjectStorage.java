package net.feedbacky.app.utils.objectstorage;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.social.SocialLink;
import net.feedbacky.app.rest.data.idea.Idea;
import net.feedbacky.app.rest.data.idea.attachment.Attachment;
import net.feedbacky.app.utils.Base64Utils;
import net.feedbacky.app.utils.Constants;
import net.feedbacky.app.utils.ImageUtils;
import net.feedbacky.app.utils.bunnycdn.BCDNStorage;
import net.feedbacky.app.utils.cheetaho.CheetahoOptimizer;

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
import java.util.Arrays;
import java.util.Base64;
import java.util.logging.Level;
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

  @Autowired private BCDNStorage bunnyCdnStorage;
  @Autowired private CheetahoOptimizer cheetahoOptimizer;

  public String storeEncodedAttachment(Idea idea, Base64Utils.ImageType type, String encoded) throws IOException {
    byte[] data = Base64.getDecoder().decode(encoded);
    ByteArrayInputStream bis = new ByteArrayInputStream(data);
    BufferedImage img = ImageIO.read(bis);

    String fileName = idea.getId() + "_" + RandomStringUtils.randomAlphanumeric(6);
    File output = new File("storage-data" + File.separator + type.getName() + File.separator + fileName + "." + type.getExtension());
    output.mkdirs();
    ImageIO.write(img, "png", output);
    try {


      return "https://cdn.feedbacky.net/" + type.getName() + "/" + fileName + "." + type.getExtension();
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

    File output = new File("storage-data" + File.separator + type.getName() + File.separator + fileName + "." + type.getExtension());
    output.mkdirs();
    ImageIO.write(newImg, "png", output);
    try {
      cheetahoOptimizer.compressFile(type, fileName);
      if(type == Base64Utils.ImageType.ATTACHMENT || type == Base64Utils.ImageType.SOCIAL_ICON) {

        return "https://cdn.feedbacky.net/" + type.getName() + "/" + fileName + "." + type.getExtension();
      }
      output.delete();
      File newFile = new File( "data" + File.separator + type.getName() + File.separator + "projects" + File.separator + type.getName() + File.separator + fileName + "." + type.getExtension());
      newFile.createNewFile();
      ImageIO.write(newImg, "png", newFile);

      return "https://cdn.feedbacky.net/projects/" + type.getName() + "/" + fileName + "." + type.getExtension();
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
    try {
      bunnyCdnStorage.deleteObject(path);
    } catch(Exception e) {
      Logger.getLogger("Old social icon deletion failed for url " + link.getLogoUrl() + " thus is ignored");
    }
  }

  public void deleteAttachment(Attachment attachment) {
    String path = StringUtils.remove(attachment.getUrl(), "https://cdn.feedbacky.net/");
    try {
      bunnyCdnStorage.deleteObject(path);
    } catch(Exception e) {
      Logger.getLogger("Old attachment deletion failed for url " + attachment.getUrl() + " thus is ignored");
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
    try {
      bunnyCdnStorage.deleteObject(path);
    } catch(Exception e) {
      Logger.getLogger("Old " + type.getName() + " deletion failed for url " + url + " thus is ignored");
    }
  }

}
