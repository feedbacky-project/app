package net.feedbacky.app.util;

import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.user.User;

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

  public CommentBuilder message(String message) {
    comment.setDescription(message);
    return this;
  }

  public Comment build() {
    comment.setSpecial(true);
    return comment;
  }

  public static String convertToDiffViewMode(String placeholder, String oldText, String newText) {
    return "{data_diff_view;" + placeholder + ";" + oldText + ";" + newText + "}";
  }

}
