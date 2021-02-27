package net.feedbacky.app.data.user;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.moderator.Moderator;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.LazyToOne;
import org.hibernate.annotations.LazyToOneOption;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NamedEntityGraph(name = "User.fetch", attributeNodes = {@NamedAttributeNode("permissions"), @NamedAttributeNode("mailPreferences")})
@NamedEntityGraph(name = "User.fetchConnections", attributeNodes = {@NamedAttributeNode("connectedAccounts")})
public class User implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  private String username;
  @Column(length = 355) /* increase default length for google avatars */
  private String avatar;
  private String email;

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<Moderator> permissions = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<ConnectedAccount> connectedAccounts = new HashSet<>();
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private MailPreferences mailPreferences;
  @CreationTimestamp
  private Date creationDate;
  private boolean serviceStaff = false;
  private boolean fake = false;
  private String token = "";

  public String convertToSpecialCommentMention() {
    return "{data_user;" + id + ";" + username + "}";
  }

}
