package net.feedbacky.app.config;

import org.hibernate.dialect.MySQL5Dialect;

import java.sql.Types;

/**
 * @author Plajer
 * <p>
 * Created at 27.04.2020
 */
public class MySQLCustomDialect extends MySQL5Dialect {

  public MySQLCustomDialect() {
    super();
    registerColumnType(Types.BOOLEAN, "TINYINT(1)");
  }

  //Custom MySQL dialect to support Unicode emojis in our database.
  @Override
  public String getTableTypeString() {
    return " ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
  }

}
