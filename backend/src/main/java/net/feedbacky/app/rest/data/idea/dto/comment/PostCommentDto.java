package net.feedbacky.app.rest.data.idea.dto.comment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Calendar;
import java.util.Date;

import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.validator.constraints.Length;

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
  private final Date creationDate = Calendar.getInstance().getTime();

}
