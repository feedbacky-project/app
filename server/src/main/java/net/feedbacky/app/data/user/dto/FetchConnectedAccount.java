package net.feedbacky.app.data.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 22.01.2020
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchConnectedAccount {

  private String accountType;
  private String data;

}
