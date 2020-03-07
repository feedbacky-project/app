package net.feedbacky.app.rest.data.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.feedbacky.app.rest.data.user.dto.FetchConnectedAccount;

import org.modelmapper.ModelMapper;

import javax.persistence.Column;
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
@AllArgsConstructor
@ToString
public class ConnectedAccount implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  private User user;
  private AccountType type;
  @Column(name = "data", columnDefinition = "text", length = 355)
  private String data;

  public FetchConnectedAccount convertToDto() {
    return new ModelMapper().map(this, FetchConnectedAccount.class);
  }

  public enum AccountType {
    DISCORD, GITHUB, GOOGLE
  }

}
