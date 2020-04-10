package net.feedbacky.app.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.oauth.provider.AbstractLoginProvider;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@AllArgsConstructor
@Getter
public class AboutFeedbackyData {

  private List<AbstractLoginProvider> loginProviders;
  private boolean boardsCreatingAllowed;
  private boolean maintenanceMode;

}
