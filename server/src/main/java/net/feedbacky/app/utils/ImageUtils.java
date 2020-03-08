package net.feedbacky.app.utils;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.utils.objectstorage.ObjectStorage;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

/**
 * @author Plajer
 * <p>
 * Created at 09.12.2019
 */
@Component
@Deprecated
public class ImageUtils {

  public static final String DEFAULT_BANNER_URL = "https://cdn.feedbacky.net/projects/banners/default-banner.jpg";
  public static final String DEFAULT_LOGO_URL = "https://cdn.feedbacky.net/projects/logos/default-logo.png";
  @Autowired private ObjectStorage objectStorage;

  public String updateBoardBanner(Board board, String preData) {
    return updateImage(board, preData, Base64Utils.ImageType.BANNER);
  }

  public String updateBoardLogo(Board board, String preData) {
    return updateImage(board, preData, Base64Utils.ImageType.LOGO);
  }

  private String updateImage(Board board, String preData, Base64Utils.ImageType type) {
    boolean deleteOld = true;
    switch(type) {
      case BANNER:
        deleteOld = !board.getBanner().equals(DEFAULT_BANNER_URL);
        break;
      case LOGO:
        deleteOld = !board.getLogo().equals(DEFAULT_LOGO_URL);
        break;
    }
    if(!deleteOld) {
      try {
        return objectStorage.storeEncodedImage(board, type, Base64Utils.extractBase64Data(preData));
      } catch(IOException e) {
        e.printStackTrace();
        return null;
      }
    }
    String text = "";
    switch(type) {
      case BANNER:
        text = board.getBanner();
        break;
      case LOGO:
        text = board.getLogo();
        break;
    }
    String path = StringUtils.remove(text, Constants.IMAGE_HOST);
    File target = new File("storage-data" + File.separator + path);
    if(!target.delete()) {
      Logger.getLogger("Failed to delete file with path " + path);
    }
    try {
      return objectStorage.storeEncodedImage(board, type, Base64Utils.extractBase64Data(preData));
    } catch(IOException e) {
      e.printStackTrace();
      return null;
    }
  }

}
