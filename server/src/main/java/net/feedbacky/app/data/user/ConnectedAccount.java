package net.feedbacky.app.data.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.user.dto.FetchConnectedAccount;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Entity
@Table(name = "users_connected_accounts")
@Getter
@Setter
@NoArgsConstructor
public class ConnectedAccount implements Serializable, Fetchable<FetchConnectedAccount> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private User user;
  private String provider;
  private String accountId;

  @Override
  public FetchConnectedAccount toDto() {
    return new FetchConnectedAccount().from(this);
  }
}
