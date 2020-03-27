package net.feedbacky.app.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

import org.apache.commons.configuration.Configuration;
import org.apache.commons.configuration.DatabaseConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @author Plajer
 * <p>
 * Created at 12.03.2020
 */
@Component
public class LocalConfiguration {

  @Getter
  private DatabaseConfiguration configuration;
  private DataSource dataSource;

  @Autowired
  public LocalConfiguration(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  @PostConstruct
  public void init() {
    try(Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
      stmt.execute("CREATE TABLE IF NOT EXISTS app_settings (key_col VARCHAR(255) NOT NULL PRIMARY KEY, value VARCHAR(255))");
    } catch(SQLException e) {
      e.printStackTrace();
    }
    configuration = new DatabaseConfiguration(dataSource, "app_settings", "key_col", "value");
    //setup defaults if missing
    for(Settings setting : Settings.values()) {
      if(configuration.containsKey(setting.name())) {
        continue;
      }
      configuration.addProperty(setting.name(), setting.getDefaultValue());
    }
  }

  @AllArgsConstructor
  public enum Settings {
    INITIAL_INSTALLATION(String.valueOf(true)), PUBLIC_BOARDS_CREATION(String.valueOf(true)),
    OAUTH_DISCORD_ENABLED(String.valueOf(false)), OAUTH_DISCORD_CLIENT_ID(""), OAUTH_DISCORD_CLIENT_SECRET(""),
    OAUTH_GOOGLE_ENABLED(String.valueOf(false)), OAUTH_GOOGLE_CLIENT_ID(""), OAUTH_GOOGLE_CLIENT_SECRET(""),
    OAUTH_GITHUB_ENABLED(String.valueOf(false)), OAUTH_GITHUB_CLIENT_ID(""), OAUTH_GITHUB_CLIENT_SECRET("");

    @Getter
    private String defaultValue;
  }

}
