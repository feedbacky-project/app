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
    Map<String, String> environmentVariablesMap = internalData.get("environment-variables");
    boolean enabled = Boolean.parseBoolean(LoginProvider.EnvironmentVariables.readEnvVariable(environmentVariablesMap.get("enabled"), "false"));
    LoginProvider.EnvironmentVariables environmentVariables = new LoginProvider.EnvironmentVariables(
            environmentVariablesMap.get("redirect-uri"),
            environmentVariablesMap.get("client-id"),
            environmentVariablesMap.get("client-secret")
    );
    Map<String, String> providerDataMap = internalData.get("provider-data");
    String oauthLink = providerDataMap.get("oauth-link");
    oauthLink = StringUtils.replace(oauthLink, "{CLIENT_ID}", LoginProvider.EnvironmentVariables.readEnvVariable(environmentVariables.getClientId(), ""));
    oauthLink = StringUtils.replace(oauthLink, "{CLIENT_SECRET}", LoginProvider.EnvironmentVariables.readEnvVariable(environmentVariables.getClientSecret(), ""));
    oauthLink = StringUtils.replace(oauthLink, "{REDIRECT_URI}", URLEncoder.encode(
            LoginProvider.EnvironmentVariables.readEnvVariable(environmentVariables.getRedirectUri()), "UTF-8"));
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
    return new LoginProvider(entry.getKey(), providerData, enabled, oauthDetails, environmentVariables);
  }

  public List<LoginProvider> getProviders() {
    return Collections.unmodifiableList(loginProviders);
  }

}
