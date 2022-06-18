package net.feedbacky.app.util;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
public class CommentBuilder {

  private final Comment comment = new Comment();

  public CommentBuilder of(Idea idea) {
    comment.setIdea(idea);
    return this;
  }

  public CommentBuilder by(User user) {
    comment.setCreator(user);
    return this;
  }

  public CommentBuilder type(Comment.SpecialType type) {
    comment.setSpecialType(type);
    return this;
  }

  public CommentBuilder placeholders(String... placeholders) {
    comment.setDescription(comment.getSpecialType().parsePlaceholders(placeholders));
    return this;
  }

  public CommentBuilder metadata(Comment.CommentMetadata key, String value) {
    String metadata = comment.getMetadata();
    JsonObject json;
    if(metadata == null || metadata.equals("")) {
      json = new Gson().fromJson("{}", JsonObject.class);
    } else {
      json = new Gson().fromJson(metadata, JsonObject.class);
    }
    json.addProperty(key.getKey(), value);
    comment.setMetadata(json.toString());
    return this;
  }

  public Comment build() {
    comment.setSpecial(true);
    if(comment.getMetadata() == null || comment.getMetadata().equals("")) {
      comment.setMetadata("{}");
    }
    return comment;
  }

  public static String convertToDiffViewMode(String placeholder, String oldText, String newText) {
    return "{data_diff_view;" + placeholder + ";" + oldText + ";" + newText + "}";
  }

}
