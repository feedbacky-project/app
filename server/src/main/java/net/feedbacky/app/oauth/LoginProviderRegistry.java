package net.feedbacky.app.oauth;

import net.feedbacky.app.oauth.provider.AbstractLoginProvider;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 10.03.2020
 */
@Component
public class LoginProviderRegistry {

  private List<AbstractLoginProvider> registeredProviders = new ArrayList<>();

  public List<AbstractLoginProvider> getRegisteredProviders() {
    return Collections.unmodifiableList(registeredProviders);
  }

  public void registerProvider(AbstractLoginProvider provider) {
    registeredProviders.add(provider);
  }

}
