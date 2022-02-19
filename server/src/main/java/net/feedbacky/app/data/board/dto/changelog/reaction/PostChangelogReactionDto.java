package net.feedbacky.app.data.board.dto.changelog.reaction;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2022
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PostChangelogReactionDto {

  @NotNull(message = "Reaction id cannot be empty.")
  private String reactionId;

}
