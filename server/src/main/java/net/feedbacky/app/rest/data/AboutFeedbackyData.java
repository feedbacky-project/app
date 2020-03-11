package net.feedbacky.app.rest.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.rest.oauth.provider.AbstractLoginProvider;

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

}
