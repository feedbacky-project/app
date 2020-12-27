package net.feedbacky.app.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.data.user.dto.FetchUserDto;
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

  private String serverVersion;
  private List<AbstractLoginProvider> loginProviders;
  private List<FetchUserDto> serviceAdmins;
  private boolean closedIdeasCommenting;

}
