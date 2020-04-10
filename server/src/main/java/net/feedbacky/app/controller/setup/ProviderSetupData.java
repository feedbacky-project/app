package net.feedbacky.app.controller.setup;

import lombok.AllArgsConstructor;
import lombok.Getter;
import net.feedbacky.app.annotation.enumvalue.EnumValue;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 12.03.2020
 */
@AllArgsConstructor
@Getter
public class ProviderSetupData {

  @NotNull(message = "Field 'type' cannot be null.")
  @EnumValue(enumClazz = ProviderType.class, message = "Field 'type' must be valid provider type.")
  private ProviderType type;
  @NotNull(message = "Field 'clientId' cannot be null.")
  private String clientId;
  @NotNull(message = "Field 'clientSecret' cannot be null.")
  private String clientSecret;

  public enum ProviderType {
    DISCORD, GOOGLE, GITHUB
  }

} 
