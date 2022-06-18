package net.feedbacky.app.util.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import lombok.Getter;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * @author Plajer
 * <p>
 * Created at 15.02.2022
 */
public class JwtToken {

  @Getter private final String token;
  private String secret;
  private Key key;

  public JwtToken(String token, String secret) {
    this.token = token;
    this.secret = secret;
  }

  public JwtToken(String token, Key key) {
    this.token = token;
    this.key = key;
  }

  public boolean isExpired() {
    final Date expiration = getClaimFromToken(Claims::getExpiration);
    return expiration.before(new Date());
  }

  public <T> boolean isValid(Function<Claims, T> claim, String value) {
    Object claimValue = getClaimFromToken(claim);
    return (claimValue.equals(value) && !isExpired());
  }

  public <T> T getClaimFromToken(Function<Claims, T> claimsResolver) {
    Claims claims = getAllClaimsFromToken();
    return claimsResolver.apply(claims);
  }

  private Claims getAllClaimsFromToken() {
    JwtParser parser = Jwts.parser();
    if(key != null) {
      parser = parser.setSigningKey(key);
    } else {
      parser = parser.setSigningKey(secret);
    }
    return parser.parseClaimsJws(token).getBody();
  }

}
