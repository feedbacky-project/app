package net.feedbacky.app.login;

import lombok.SneakyThrows;
import net.feedbacky.app.util.FileResourceUtils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 21.01.2021
 */
@Component
public class LoginProviderRegistry {

  private List<LoginProvider> loginProviders = new ArrayList<>();

  public LoginProviderRegistry() {
    loadProviders();
  }

  public Optional<LoginProvider> getLoginProviderById(String id) {
    for(LoginProvider provider : loginProviders) {
      if(provider.getId().equals(id)) {
        return Optional.of(provider);
      }
    }
    return Optional.empty();
  }


  @SneakyThrows
  private void loadProviders() {
    ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
    String contents = FileResourceUtils.readFileContents("oauth_providers.yml");
    Map<String, Map<String, Map<String, String>>> data = mapper.readValue(contents, new TypeReference<Map<String, Map<String, Map<String, String>>>>() {});
    for(Map.Entry<String, Map<String, Map<String, String>>> entry : data.entrySet()) {
      loginProviders.add(getDataFromMap(entry));
    }
  }

  @SneakyThrows
  private LoginProvider getDataFromMap(Map.Entry<String, Map<String, Map<String, String>>> entry) {
    Map<String, Map<String, String>> internalData = entry.getValue();
    LoginProvider.EnvironmentVariables environmentVariables = new LoginProvider.EnvironmentVariables(entry.getKey());
    Map<String, String> providerDataMap = internalData.get("provider-data");
    String oauthLink = providerDataMap.get("oauth-link");
    oauthLink = StringUtils.replace(oauthLink, "{CLIENT_ID}", environmentVariables.getClientId());
    oauthLink = StringUtils.replace(oauthLink, "{CLIENT_SECRET}", environmentVariables.getClientSecret());
    oauthLink = StringUtils.replace(oauthLink, "{REDIRECT_URI}", URLEncoder.encode(environmentVariables.getRedirectUri(), "UTF-8"));
    LoginProvider.ProviderData providerData = new LoginProvider.ProviderData(
            providerDataMap.get("name"),
            oauthLink,
            providerDataMap.get("icon"),
            providerDataMap.get("color")
    );
    Map<String, String> oauthDetailsMap = internalData.get("oauth");
    Map<String, String> dataFieldsMap = internalData.get("data-fields");
    LoginProvider.OauthDetails.DataFields dataFields = new LoginProvider.OauthDetails.DataFields(
            dataFieldsMap.get("id"),
            dataFieldsMap.get("email"),
            dataFieldsMap.get("username"),
            dataFieldsMap.get("avatar"),
            dataFieldsMap.get("email-verified")
    );
    LoginProvider.OauthDetails oauthDetails = new LoginProvider.OauthDetails(
            oauthDetailsMap.get("token-url"),
            oauthDetailsMap.get("authorization-property"),
            oauthDetailsMap.get("user-url"),
            dataFields
    );
    return new LoginProvider(entry.getKey(), providerData, isIntegrationEnabled(environmentVariables), oauthDetails, environmentVariables);
  }

  private boolean isIntegrationEnabled(LoginProvider.EnvironmentVariables env) {
    return !env.getClientId().equals("") && !env.getClientSecret().equals("") && !env.getRedirectUri().equals("");
  }

  public List<LoginProvider> getProviders() {
    return Collections.unmodifiableList(loginProviders);
  }

}
