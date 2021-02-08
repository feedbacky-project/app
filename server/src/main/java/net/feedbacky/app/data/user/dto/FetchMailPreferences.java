package net.feedbacky.app.data.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.user.MailPreferences;

/**
 * @author Plajer
 * <p>
 * Created at 03.05.2020
 */
@Getter
@Setter
@NoArgsConstructor
public class FetchMailPreferences implements FetchResponseDto<FetchMailPreferences, MailPreferences> {

  private boolean notificationsEnabled;

  @Override
  public FetchMailPreferences from(MailPreferences entity) {
    this.notificationsEnabled = entity.isNotificationsEnabled();
    return this;
  }

}
