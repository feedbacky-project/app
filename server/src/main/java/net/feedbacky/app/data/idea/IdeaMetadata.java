package net.feedbacky.app.data.idea;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 04.11.2021
 */
@Entity
@Table(name = "ideas_metadata")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class IdeaMetadata implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String key;
  private String value;

  @AllArgsConstructor
  @Getter
  public enum MetadataValue {
    DISCORD_WEBHOOK_MESSAGE_ID("discord_webhook_msg_id_{id}");

    private final String key;

    public String parseKey(long id) {
      return parseKey(String.valueOf(id));
    }

    public String parseKey(String id) {
      return key.replace("{id}", id);
    }

  }

}
