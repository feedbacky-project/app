package net.feedbacky.app.data.emoji;

import lombok.Data;
import lombok.SneakyThrows;
import net.feedbacky.app.util.FileResourceUtils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 05.01.2022
 */
@Component
public class EmojiDataRegistry {

  private List<EmojiData> emojisData = new ArrayList<>();

  public EmojiDataRegistry() {
    loadEmojis();
  }

  @SneakyThrows
  private void loadEmojis() {
    ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
    String contents = FileResourceUtils.readFileContents("default_reactions.yml");
    Map<String, Map<String, String>> data = mapper.readValue(contents, new TypeReference<Map<String, Map<String, String>>>() {});
    for(Map.Entry<String, Map<String, String>> entry : data.entrySet()) {
      Map<String, String> emoteFile = entry.getValue();
      EmojiData emojiData = new EmojiData();
      emojiData.setId(entry.getKey());
      emojiData.setPath(emoteFile.get("path"));
      emojiData.setName(emoteFile.get("name"));
      emojisData.add(emojiData);
    }
  }

  public List<EmojiData> getEmojis() {
    return Collections.unmodifiableList(emojisData);
  }

  @Data
  public static class EmojiData {

    private String id;
    private String path;
    private String name;

  }

}
