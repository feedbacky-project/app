package net.feedbacky.app.data.idea.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.idea.comment.Comment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotNull;

import java.util.Calendar;
import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostCommentDto {

  @NotNull(message = "Idea id cannot be empty.")
  private long ideaId;
  @NotNull(message = "Description cannot be empty.")
  @Length(min = 10, max = 650, message = "Description cannot be shorter than 10 or longer than 650 characters.")
  private String description;
  @EnumValue(enumClazz = Comment.ViewType.class, message = "Comment type must be valid view type.")
  @NotNull(message = "Type cannot be empty.")
  private String type;
  private final Date creationDate = Calendar.getInstance().getTime();

}
