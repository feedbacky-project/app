package net.feedbacky.app.util;

import lombok.SneakyThrows;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * @author Plajer
 * <p>
 * Created at 18.02.2021
 */
@Component
public class RandomNicknameUtils {

  @Value("classpath:anonymous_nicknames.yml")
  private Resource file;
  private List<String> nicknames = new ArrayList<>();
  private Random random = new Random();

  @SneakyThrows
  @PostConstruct
  private void loadNicknames() {
    BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
    String line;
    while((line = reader.readLine()) != null) {
      nicknames.add(line);
    }
  }

  public String getRandomNickname() {
    return nicknames.get(random.nextInt(nicknames.size()));
  }

}
