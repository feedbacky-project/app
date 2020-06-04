package net.feedbacky.app.util.imagecompress;

import lombok.Getter;

import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * @author Plajer
 * <p>
 * Created at 08.03.2020
 */
@Component
public class ImageCompressor {

  private final boolean enabled = Boolean.parseBoolean(System.getenv("IMAGE_COMPRESSION_ENABLED"));
  private final String compressorType = System.getenv("IMAGE_COMPRESSION_TYPE");
  @Getter private Compressor compressor = getDefaultCompressor();

  @PostConstruct
  public void init() {
    if(!enabled) {
      return;
    }
    if(compressorType.equalsIgnoreCase("cheetaho")) {
      compressor = new CheetahoCompressor();
    }
  }

  private Compressor getDefaultCompressor() {
    //default compressor does nothing
    return localPath -> {
    };
  }

}
