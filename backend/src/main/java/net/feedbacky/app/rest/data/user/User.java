package net.feedbacky.app.rest.data.user;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import net.feedbacky.app.rest.data.board.moderator.Moderator;

import org.hibernate.annotations.CreationTimestamp;
import org.modelmapper.ModelMapper;

import net.feedbacky.app.rest.data.user.dto.FetchUserDto;

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

  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<Moderator> permissions = new HashSet<>();
  @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
  private Set<ConnectedAccount> connectedAccounts = new HashSet<>();
  @CreationTimestamp
  private Date creationDate;
  private boolean serviceStaff = false;

  public FetchUserRequest convertToDto() {
    FetchUserDto dto = new ModelMapper().map(this, FetchUserDto.class);
    return new FetchUserRequest(dto);
  }

  //a way to avoid convertToDto(boolean) as it doesn't explain this does
  public static class FetchUserRequest {

    private FetchUserDto dto;

    public FetchUserRequest(FetchUserDto dto) {
      this.dto = dto;
    }

    public FetchUserDto exposeSensitiveData(boolean expose) {
      if (!expose) {
        dto.setEmail(null);
      }
      return dto;
    }

  }

}
