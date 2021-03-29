package net.feedbacky.app.data.board.webhook;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.util.mailservice.MailService;

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
public class WebhookExecutor {

  private final Board board;

  public WebhookExecutor(Board board) {
    this.board = board;
  }

  public void executeWebhooks(Webhook.Event event, Map<String, String> data) {
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
        break;
      case DISCORD:
        executeDiscordEndpoint(webhook, event, data);
        break;
    }
  }

  private void executeCustomEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    //todo
  }

  private void executeDiscordEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    DiscordWebhook discordWebhook = new DiscordWebhook(webhook.getUrl());
    discordWebhook.setAvatarUrl(board.getLogo());
    discordWebhook.setUsername(board.getName());
    DiscordWebhook.EmbedObject embedObject = new DiscordWebhook.EmbedObject();
    embedObject.setColor(Color.decode(board.getThemeColor()));
    embedObject.setTitle(event.getFormattedMessage(data.getOrDefault(WebhookMapData.IDEA_NAME.getName(), "")));
    embedObject.setTimestamp(new Timestamp(Calendar.getInstance().getTime().getTime()));
    if(event == Webhook.Event.IDEA_DELETE) {
      embedObject.setUrl(MailService.HOST_ADDRESS + "/b/" + board.getDiscriminator());
    } else {
      embedObject.setUrl(data.get(WebhookMapData.IDEA_LINK.getName()));
    }
    switch(event) {
      case IDEA_CREATE:
      case IDEA_DELETE:
      case IDEA_OPEN:
      case IDEA_CLOSE:
      case IDEA_EDIT:
        embedObject.addField("Description", data.get(WebhookMapData.IDEA_DESCRIPTION.getName()), true);
        break;
      case IDEA_COMMENT:
      case IDEA_COMMENT_DELETE:
        embedObject.addField("Comment", data.get(WebhookMapData.COMMENT_DESCRIPTION.getName()), true);
        break;
      case IDEA_TAG_CHANGE:
        embedObject.addField("Tags Changed", data.get(WebhookMapData.TAGS_CHANGED.getName()), true);
        break;
      case CHANGELOG_CREATE:
        embedObject.addField("Description", data.get(WebhookMapData.CHANGELOG_DESCRIPTION.getName()), true);
        break;
    }
    switch(event) {
      case IDEA_CREATE:
      case IDEA_COMMENT:
      case CHANGELOG_CREATE:
        embedObject.setFooter("Posted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_DELETE:
      case IDEA_COMMENT_DELETE:
        embedObject.setFooter("Deleted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_EDIT:
      case IDEA_TAG_CHANGE:
        embedObject.setFooter("Edited by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_OPEN:
        embedObject.setFooter("Opened by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case IDEA_CLOSE:
        embedObject.setFooter("Closed by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
      case SAMPLE_EVENT:
        embedObject.setFooter("Requested by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName()));
        break;
    }
    discordWebhook.addEmbed(embedObject);
    try {
      discordWebhook.execute();
    } catch(IOException ignored) {
    }
  }

  public enum WebhookMapData {
    USER_NAME("user_name"), USER_AVATAR("user_avatar"), USER_ID("user_id"), IDEA_NAME("idea_name"),
    IDEA_DESCRIPTION("idea_description"), IDEA_LINK("idea_link"), IDEA_ID("idea_id"),
    COMMENT_DESCRIPTION("comment_description"), COMMENT_ID("comment_id"), TAGS_CHANGED("tags_changed"),
    CHANGELOG_NAME("changelog_name"), CHANGELOG_DESCRIPTION("changelog_description");

    private final String name;

    WebhookMapData(String name) {
      this.name = name;
    }

    public String getName() {
      return name;
    }
  }

}
