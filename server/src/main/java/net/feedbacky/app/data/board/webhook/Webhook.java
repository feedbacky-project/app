package net.feedbacky.app.data.board.webhook;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.Board;

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
    IDEA_CREATE(0, "New Idea Created - `${placeholder}`"), IDEA_DELETE(1, "Idea Deleted - `${placeholder}`"),
    IDEA_COMMENT(2, "Idea Commented - `${placeholder}`"), IDEA_COMMENT_DELETE(3, "Idea Comment Deleted - `${placeholder}`"),
    IDEA_EDIT(4, "Idea Edited - `${placeholder}`"), IDEA_TAG_CHANGE(6, "Tags of Idea Changed - `${placeholder}`"),
    IDEA_OPEN(7, "Idea Opened - `${placeholder}`"), IDEA_CLOSE(8, "Idea Closed - `${placeholder}`"),
    SAMPLE_EVENT(9, "I am alive! Sample request received."), IDEA_COMMENTS_RESTRICT(10, "Idea Commenting Restricted - `${placeholder}`"),
    IDEA_COMMENTS_ALLOW(10, "Idea Commenting Allowed - `${placeholder}`"), CHANGELOG_CREATE(11, "New Changelog Created - `${placeholder}`");

    private final int id;
    private final String message;

    Event(int id, String message) {
      this.id = id;
      this.message = message;
    }

    public int getId() {
      return id;
    }

    public String getFormattedMessage(String placeholder) {
      return message.replace("${placeholder}", placeholder);
    }
  }

}
