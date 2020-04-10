package net.feedbacky.app.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * @author Plajer
 * <p>
 * Created at 09.03.2020
 */
@Configuration
public class DataSourceConfig {

  @Bean
  public DataSource getDataSource() {
    DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
    dataSourceBuilder.driverClassName("com.mysql.cj.jdbc.Driver");
    dataSourceBuilder.url(System.getenv("MYSQL_URL"));
    dataSourceBuilder.username(System.getenv("MYSQL_USERNAME"));
    dataSourceBuilder.password(System.getenv("MYSQL_PASSWORD"));
    return dataSourceBuilder.build();
  }

}
