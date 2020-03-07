package net.feedbacky.app.service;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.Assert;

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * @author Plajer
 * <p>
 * Created at 12.11.2019
 */
public class ServiceUser implements UserDetails, CredentialsContainer {

  private static final long serialVersionUID = 520L;
  private final Set<GrantedAuthority> authorities;
  private final boolean accountNonExpired;
  private final boolean accountNonLocked;
  private final boolean credentialsNonExpired;
  private final boolean enabled;
  private String email;
  private String username;

  public ServiceUser(String username, String email, Collection<? extends GrantedAuthority> authorities) {
    this(username, email, true, true, true, true, authorities);
  }

  public ServiceUser(String username, String email, boolean enabled, boolean accountNonExpired, boolean credentialsNonExpired, boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities) {
    if (username != null && !"".equals(username) && email != null) {
      this.username = username;
      this.email = email;
      this.enabled = enabled;
      this.accountNonExpired = accountNonExpired;
      this.credentialsNonExpired = credentialsNonExpired;
      this.accountNonLocked = accountNonLocked;
      this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
    } else {
      throw new IllegalArgumentException("Cannot pass null or empty values to constructor");
    }
  }

  private static SortedSet<GrantedAuthority> sortAuthorities(Collection<? extends GrantedAuthority> authorities) {
    Assert.notNull(authorities, "Cannot pass a null GrantedAuthority collection");
    SortedSet<GrantedAuthority> sortedAuthorities = new TreeSet<>(new ServiceUser.AuthorityComparator());

    for (GrantedAuthority grantedAuthority : authorities) {
      Assert.notNull(grantedAuthority, "GrantedAuthority list cannot contain any null elements");
      sortedAuthorities.add(grantedAuthority);
    }

    return sortedAuthorities;
  }

  public Collection<GrantedAuthority> getAuthorities() {
    return this.authorities;
  }

  public String getEmail() {
    return this.email;
  }

  public String getPassword() {
    throw new UnsupportedOperationException("Passwords don't exist for feedbacky users.");
  }

  public String getUsername() {
    return this.username;
  }

  public boolean isEnabled() {
    return this.enabled;
  }

  public boolean isAccountNonExpired() {
    return this.accountNonExpired;
  }

  public boolean isAccountNonLocked() {
    return this.accountNonLocked;
  }

  public boolean isCredentialsNonExpired() {
    return this.credentialsNonExpired;
  }

  public void eraseCredentials() {
    this.email = null;
  }

  public boolean equals(Object rhs) {
    return rhs instanceof ServiceUser && this.username.equals(((ServiceUser) rhs).username);
  }

  public int hashCode() {
    return this.username.hashCode();
  }

  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString()).append(": ");
    sb.append("Username: ").append(this.username).append("; ");
    sb.append("Email: [PROTECTED]; ");
    sb.append("Enabled: ").append(this.enabled).append("; ");
    sb.append("AccountNonExpired: ").append(this.accountNonExpired).append("; ");
    sb.append("credentialsNonExpired: ").append(this.credentialsNonExpired).append("; ");
    sb.append("AccountNonLocked: ").append(this.accountNonLocked).append("; ");
    if (!this.authorities.isEmpty()) {
      sb.append("Granted Authorities: ");
      boolean first = true;

      for (GrantedAuthority auth : this.authorities) {
        if (!first) {
          sb.append(",");
        }

        first = false;
        sb.append(auth);
      }
    } else {
      sb.append("Not granted any authorities");
    }

    return sb.toString();
  }

  private static class AuthorityComparator implements Comparator<GrantedAuthority>, Serializable {
    private static final long serialVersionUID = 520L;

    private AuthorityComparator() {
    }

    public int compare(GrantedAuthority g1, GrantedAuthority g2) {
      if (g2.getAuthority() == null) {
        return -1;
      } else {
        return g1.getAuthority() == null ? 1 : g1.getAuthority().compareTo(g2.getAuthority());
      }
    }
  }
}
