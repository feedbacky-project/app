package net.feedbacky.app.data.board.dto.integration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.NotNull;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchIntegrationDto {

  @NotNull(message = "Integration data cannot be empty.")
  private String data;

}
