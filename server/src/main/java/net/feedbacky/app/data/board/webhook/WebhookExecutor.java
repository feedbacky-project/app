package net.feedbacky.app.data.board.webhook;

import club.minnced.discord.webhook.WebhookClient;
import club.minnced.discord.webhook.send.WebhookEmbed;
import club.minnced.discord.webhook.send.WebhookEmbedBuilder;
import club.minnced.discord.webhook.send.WebhookMessageBuilder;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.util.mailservice.MailService;

import org.springframework.stereotype.Component;

import java.awt.Color;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

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

  public CompletableFuture<String> executeWebhook(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    switch(webhook.getType()) {
      case CUSTOM_ENDPOINT:
        return executeCustomEndpoint(webhook, event, data);
      case DISCORD:
        return executeDiscordEndpoint(webhook, event, data);
    }
    return CompletableFuture.completedFuture(null);
  }

  private CompletableFuture<String> executeCustomEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    //todo
    return CompletableFuture.completedFuture(null);
  }

  private CompletableFuture<String> executeDiscordEndpoint(Webhook webhook, Webhook.Event event, Map<String, String> data) {
    WebhookClient client = WebhookClient.withUrl(webhook.getUrl());
    WebhookMessageBuilder builder = new WebhookMessageBuilder();
    Board board = webhook.getBoard();
    builder.setAvatarUrl(board.getLogo());
    builder.setUsername(board.getName());
    String url;
    if(event == Webhook.Event.IDEA_DELETE) {
      url = MailService.HOST_ADDRESS + "/b/" + board.getDiscriminator();
    } else {
      url = data.get(WebhookMapData.IDEA_LINK.getName());
    }
    WebhookEmbedBuilder embedBuilder = new WebhookEmbedBuilder()
            .setColor(Color.decode(board.getThemeColor()).getRGB())
            .setTitle(new WebhookEmbed.EmbedTitle(event.getFormattedMessage(data.getOrDefault(WebhookMapData.IDEA_NAME.getName(), "")), url))
            .setTimestamp(new Timestamp(Calendar.getInstance().getTime().getTime()).toInstant());

    switch(event) {
      case IDEA_CREATE:
      case IDEA_DELETE:
      case IDEA_OPEN:
      case IDEA_CLOSE:
      case IDEA_EDIT:
        embedBuilder.addField(new WebhookEmbed.EmbedField(true, "Description", data.get(WebhookMapData.IDEA_DESCRIPTION.getName())));
        break;
      case IDEA_COMMENT:
      case IDEA_COMMENT_DELETE:
        embedBuilder.addField(new WebhookEmbed.EmbedField(true, "Comment", data.get(WebhookMapData.COMMENT_DESCRIPTION.getName())));
        break;
      case IDEA_TAG_CHANGE:
        embedBuilder.addField(new WebhookEmbed.EmbedField(true, "Tags Changed", data.get(WebhookMapData.TAGS_CHANGED.getName())));
        break;
      case CHANGELOG_CREATE:
        embedBuilder.addField(new WebhookEmbed.EmbedField(true, "Tags Changed", data.get(WebhookMapData.TAGS_CHANGED.getName())))
                .setTitle(new WebhookEmbed.EmbedTitle(event.getFormattedMessage(data.getOrDefault(WebhookMapData.CHANGELOG_NAME.getName(), "")),
                        MailService.HOST_ADDRESS + "/b/" + board.getDiscriminator() + "/changelog"));
        break;
    }
    switch(event) {
      case IDEA_CREATE:
      case IDEA_COMMENT:
      case CHANGELOG_CREATE:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Posted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
      case IDEA_DELETE:
      case IDEA_COMMENT_DELETE:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Deleted by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
      case IDEA_EDIT:
      case IDEA_TAG_CHANGE:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Edited by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
      case IDEA_OPEN:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Opened by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
      case IDEA_CLOSE:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Closed by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
      case SAMPLE_EVENT:
        embedBuilder.setFooter(new WebhookEmbed.EmbedFooter("Requested by " + data.get(WebhookMapData.USER_NAME.getName()), data.get(WebhookMapData.USER_AVATAR.getName())));
        break;
    }
    String msgId = data.get(WebhookMapData.IDEA_DISCORD_MESSAGE_ID_METADATA.getName());
    if(msgId == null) {
      return client.send(embedBuilder.build()).thenApply(res -> String.valueOf(res.getId()));
    } else {
      return client.edit(Long.parseLong(msgId), embedBuilder.build()).thenApply(res -> String.valueOf(res.getId()));
    }
  }

  public enum WebhookMapData {
    USER_NAME("user_name"), USER_AVATAR("user_avatar"), USER_ID("user_id"), IDEA_NAME("idea_name"),
    IDEA_DESCRIPTION("idea_description"), IDEA_LINK("idea_link"), IDEA_ID("idea_id"),
    IDEA_DISCORD_MESSAGE_ID_METADATA("idea_discord_msg_id"), COMMENT_DESCRIPTION("comment_description"), COMMENT_ID("comment_id"),
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
