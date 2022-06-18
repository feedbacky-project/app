package net.feedbacky.app.data.user;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.user.dto.FetchMailPreferences;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 03.05.2020
 */
@Entity
@Table(name = "users_mail_preferences")
@Getter
@Setter
@NoArgsConstructor
public class MailPreferences implements Serializable, Fetchable<FetchMailPreferences> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @OneToOne
  @JoinColumn(name = "user_id")
  private User user;
  private boolean notificationsEnabled;
  private String unsubscribeToken;

  @Override
  public FetchMailPreferences toDto() {
    return new FetchMailPreferences().from(this);
  }
}
