package net.feedbacky.app.data.idea.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.feedbacky.app.annotation.enumvalue.EnumValue;
import net.feedbacky.app.data.board.webhook.Webhook;
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

  @NotNull(message = "Field 'ideaId' cannot be null.")
  private long ideaId;
  @NotNull(message = "Field 'description' cannot be null.")
  @Length(min = 10, max = 650, message = "Field 'description' cannot be shorter than 10 or longer than 650 characters.")
  private String description;
  @EnumValue(enumClazz = Comment.ViewType.class, message = "Field 'type' must be valid view type.")
  @NotNull(message = "Field 'type' cannot be null.")
  private String type;
  private final Date creationDate = Calendar.getInstance().getTime();

}
