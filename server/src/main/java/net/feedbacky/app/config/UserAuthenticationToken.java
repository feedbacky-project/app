package net.feedbacky.app.config;

import lombok.EqualsAndHashCode;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@EqualsAndHashCode(callSuper = false)
public class UserAuthenticationToken extends AbstractAuthenticationToken {

  private static final long serialVersionUID = 520L;
  private final Object principal;
  private Object credentials;

  public UserAuthenticationToken(Object principal, Object credentials) {
    super(null);
    this.principal = principal;
    this.credentials = credentials;
    this.setAuthenticated(false);
  }

  public UserAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
    super(authorities);
    this.principal = principal;
    this.credentials = credentials;
    super.setAuthenticated(true);
  }

  public Object getCredentials() {
    return this.credentials;
  }

  public Object getPrincipal() {
    return this.principal;
  }

  public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
    if (isAuthenticated) {
      throw new IllegalArgumentException("Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
    } else {
      super.setAuthenticated(false);
    }
  }

  public void eraseCredentials() {
    super.eraseCredentials();
    this.credentials = null;
  }

}
