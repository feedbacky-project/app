package net.feedbacky.app.data.board.webhook;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 24.11.2019
 */
@Component
public class WebhookExecutor {

  public void executeWebhooks(Board board, Webhook.Event event, Map<String, String> data) {
    for(Webhook webhook : board.getWebhooks()) {
      if(!webhook.getEvents().contains(event) && event != Webhook.Event.SAMPLE_EVENT) {
        continue;
      }
      executeWebhook(webhook, event, data);
    }
  }

  public void executeWebhook(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    switch(webhook.getType()) {
      case CUSTOM_ENDPOINT:
        executeCustomEndpoint(webhook, event, data);
        return;
      case DISCORD:
        executeDiscordEndpoint(webhook, event, data);
        return;
    }
    return;
  }

  private void executeCustomEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    //todo
    return;
  }

  private void executeDiscordEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    DiscordWebhook client = new DiscordWebhook(webhook.getUrl());
    Board board = webhook.getBoard();
    client.setAvatarUrl(board.getLogo());
    client.setUsername(board.getName());
    String url;
    if(event == Webhook.Event.IDEA_DELETE) {
      url = MailService.HOST_ADDRESS + "/b/" + board.getDiscriminator();
    } else {
      url = data.get(WebhookMapData.IDEA_LINK.getName());
    }
    DiscordWebhook.EmbedObject embedBuilder = new DiscordWebhook.EmbedObject()
            .setColor(Color.decode(board.getThemeColor()))
            .setTitle(event.getFormattedMessage(data.getOrDefault(WebhookMapData.IDEA_NAME.getName(), "")))
            .setUrl(url);
    embedBuilder.setTimestamp(new Timestamp(Calendar.getInstance().getTime().getTime()));

    switch(event) {
      case IDEA_CREATE:
      case IDEA_DELETE:
      case IDEA_OPEN:
      case IDEA_CLOSE:
      case IDEA_EDIT:
        embedBuilder.addField("Title", data.get(WebhookMapData.IDEA_TITLE.getName()), true);
        embedBuilder.addField("Description", data.get(WebhookMapData.IDEA_DESCRIPTION.getName()), true);
        break;
      case IDEA_COMMENT:
      case IDEA_COMMENT_DELETE:
        embedBuilder.addField("Comment", data.get(WebhookMapData.COMMENT_DESCRIPTION.getName()), true);
        break;
      case IDEA_TAG_CHANGE:
        embedBuilder.addField("Tags Changed", data.get(WebhookMapData.TAGS_CHANGED.getName()), true);
        break;
      case CHANGELOG_CREATE:
        embedBuilder.addField("Description", data.get(WebhookMapData.CHANGELOG_DESCRIPTION.getName()), true)
                .setTitle(event.getFormattedMessage(data.getOrDefault(WebhookMapData.CHANGELOG_NAME.getName(), "")))
                .setUrl(MailService.HOST_ADDRESS + "/b/" + board.getDiscriminator() + "/changelog");
        break;
    }
    switch(event) {
      case IDEA_CREATE:
      case IDEA_COMMENT:
      case CHANGELOG_CREATE:
        embedBuilder.setFooter("Posted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_DELETE:
      case IDEA_COMMENT_DELETE:
        embedBuilder.setFooter("Deleted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_EDIT:
      case IDEA_TAG_CHANGE:
        embedBuilder.setFooter("Edited by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_OPEN:
        embedBuilder.setFooter("Opened by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_CLOSE:
        embedBuilder.setFooter("Closed by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case SAMPLE_EVENT:
        embedBuilder.setFooter("Requested by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
    }
    client.addEmbed(embedBuilder);
    try {
      client.execute();
    } catch(IOException ex) {
      ex.printStackTrace();
    }
  }

  public enum WebhookMapData {
    USER_NAME("user_name"), USER_AVATAR("user_avatar"), USER_ID("user_id"), IDEA_NAME("idea_name"), IDEA_TITLE("idea_title"),
    IDEA_DESCRIPTION("idea_description"), IDEA_LINK("idea_link"), IDEA_ID("idea_id"), COMMENT_DESCRIPTION("comment_description"), COMMENT_ID("comment_id"),
    TAGS_CHANGED("tags_changed"), CHANGELOG_NAME("changelog_name"), CHANGELOG_DESCRIPTION("changelog_description");

    private final String name;

    WebhookMapData(String name) {
      this.name = name;
    }

    public String getName() {
      return name;
    }
  }

}
