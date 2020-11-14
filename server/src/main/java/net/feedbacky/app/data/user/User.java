package net.feedbacky.app.data.user;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.board.moderator.Moderator;
import net.feedbacky.app.data.user.dto.FetchUserDto;

import org.hibernate.annotations.CreationTimestamp;
import org.modelmapper.ModelMapper;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

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
public class User implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  private String username;
  private String avatar;
  private String email;

  @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<Moderator> permissions = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<ConnectedAccount> connectedAccounts = new HashSet<>();
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private MailPreferences mailPreferences;
  @CreationTimestamp
  private Date creationDate;
  private boolean serviceStaff = false;

  public FetchUserRequest convertToDto() {
    FetchUserDto dto = new ModelMapper().map(this, FetchUserDto.class);
    dto.setMailPreferences(mailPreferences.convertToDto());
    dto.setPermissions(permissions.stream().map(Moderator::convertToUserPermissionDto).collect(Collectors.toList()));
    return new FetchUserRequest(dto);
  }

  public String convertToSpecialCommentMention() {
    return "{data_user;" + id + ";" + username + "}";
  }

  //a way to avoid convertToDto(boolean) as it doesn't explain this does
  public static class FetchUserRequest {

    private final FetchUserDto dto;

    public FetchUserRequest(FetchUserDto dto) {
      this.dto = dto;
    }

    public FetchUserDto exposeSensitiveData(boolean expose) {
      if(!expose) {
        dto.setEmail(null);
      }
      return dto;
    }

  }

}
