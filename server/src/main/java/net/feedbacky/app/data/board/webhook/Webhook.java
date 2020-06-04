package net.feedbacky.app.data.board.webhook;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.webhook.FetchWebhookDto;

import org.modelmapper.ModelMapper;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Entity
@Table(name = "boards_webhooks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Webhook implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id")
  private Board board;
  private String url;
  private Type type;
  @ElementCollection(targetClass = Event.class)
  private List<Event> events = new ArrayList<>();

  public FetchWebhookDto convertToDto() {
    return new ModelMapper().map(this, FetchWebhookDto.class);
  }

  public enum Type {
    CUSTOM_ENDPOINT(0), DISCORD(1);

    private final int id;

    Type(int id) {
      this.id = id;
    }

    public int getId() {
      return id;
    }
  }

  public enum Event {
    IDEA_CREATE(0, "New Idea Created - `${idea.name}`"), IDEA_DELETE(1, "Idea Deleted - `${idea.name}`"),
    IDEA_COMMENT(2, "Idea Commented - `${idea.name}`"), IDEA_COMMENT_DELETE(3, "Idea Comment Deleted - `${idea.name}`"),
    IDEA_EDIT(4, "Idea Edited - `${idea.name}`"), IDEA_TAG_CHANGE(6, "Tags of Idea Changed - `${idea.name}`"),
    IDEA_OPEN(7, "Idea Opened - `${idea.name}`"), IDEA_CLOSE(8, "Idea Closed - `${idea.name}`"),
    SAMPLE_EVENT(9, "I am alive! Sample request received.");

    private final int id;
    private final String message;

    Event(int id, String message) {
      this.id = id;
      this.message = message;
    }

    public int getId() {
      return id;
    }

    public String getFormattedMessage(String ideaName) {
      return message.replace("${idea.name}", ideaName);
    }
  }

}
