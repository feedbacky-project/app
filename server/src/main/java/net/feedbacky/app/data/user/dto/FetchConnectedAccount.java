package net.feedbacky.app.data.user.dto;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.user.ConnectedAccount;

/**
 * @author Plajer
 * <p>
 * Created at 22.01.2020
 */
@Getter
public class FetchConnectedAccount implements FetchResponseDto<FetchConnectedAccount, ConnectedAccount> {

  private String provider;
  private String accountId;

  @Override
  public FetchConnectedAccount from(ConnectedAccount account) {
    this.provider = account.getProvider();
    this.accountId = account.getAccountId();
    return this;
  }

}
