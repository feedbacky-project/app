package net.feedbacky.app.data.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 03.05.2020
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchMailPreferences {

  private boolean notifyFromModeratorsComments;
  private boolean notifyFromTagsChange;
  private boolean notifyFromStatusChange;

}
