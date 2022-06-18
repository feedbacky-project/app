package net.feedbacky.app.data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.data.emoji.EmojiDataRegistry;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.login.LoginProvider;

import java.util.List;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2020
 */
@AllArgsConstructor
@Getter
public class AboutFeedbackyData {

  private String serverVersion;
  private List<LoginProvider.ProviderData> loginProviders;
  private List<FetchUserDto> serviceAdmins;
  private List<EmojiDataRegistry.EmojiData> emojisData;
  private Map<String, List<ActionTrigger.Trigger>> actionTriggers;
  private List<String> integrationsAvailable;
  private boolean mailLoginEnabled;
  private boolean developmentMode;

}
