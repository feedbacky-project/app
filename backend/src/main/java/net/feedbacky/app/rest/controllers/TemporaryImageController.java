package net.feedbacky.app.rest.controllers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

import javax.servlet.http.HttpServletResponse;

import net.feedbacky.app.exception.FeedbackyRestException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import net.feedbacky.app.utils.Base64Utils;

/**
 * @author Plajer
 * <p>
 * Created at 18.12.2019
 */
@CrossOrigin
@Controller
@Deprecated //todo remove me
public class TemporaryImageController {

  @GetMapping(value = "temp/data/{type}/{id}", produces = {"image/png", "image/jpeg"})
  @ResponseBody
  public byte[] getTemporaryImage(HttpServletResponse response, @PathVariable String type, @PathVariable String id) throws IOException {
    Base64Utils.ImageType imageType = null;
    for (Base64Utils.ImageType imgType : Base64Utils.ImageType.values()) {
      if (imgType.getName().equals(type)) {
        imageType = imgType;
        break;
      }
    }
    if (imageType == null) {
      throw new FeedbackyRestException(HttpStatus.NOT_FOUND, "Temporary resource not found.");
    }
    File file = new File(System.getProperty("user.dir").replace("\\", "/") + "/tmp/"
        + imageType.getName() + "/" + id);
    if (!file.exists()) {
      throw new FeedbackyRestException(HttpStatus.NOT_FOUND, "Temporary resource not found.");
    }
    return Files.readAllBytes(file.toPath());
  }

}
