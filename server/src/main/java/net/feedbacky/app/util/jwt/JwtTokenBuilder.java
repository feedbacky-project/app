package net.feedbacky.app.util.jwt;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * @author Plajer
 * <p>
 * Created at 15.02.2022
 */
public class JwtTokenBuilder {

  public static final long JWT_TOKEN_VALIDITY_DAYS = 30;
  public static final String DEFAULT_SECRET = System.getenv("JWT_SECRET");

  private String subject;
  private String issuer;
  private Map<String, Object> claims = new HashMap<>();
  private Date expiration = new Date(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(JWT_TOKEN_VALIDITY_DAYS));
  private SignatureAlgorithm algorithm = SignatureAlgorithm.HS512;
  private String secret = DEFAULT_SECRET;
  private Key key;

  public JwtTokenBuilder withSubject(String subject) {
    this.subject = subject;
    return this;
  }

  public JwtTokenBuilder withIssuer(String issuer) {
    this.issuer = issuer;
    return this;
  }

  public JwtTokenBuilder withClaims(Map<String, Object> claims) {
    this.claims = claims;
    return this;
  }

  public JwtTokenBuilder withExpirationDate(Date expiration) {
    this.expiration = expiration;
    return this;
  }

  public JwtTokenBuilder withAlgorithm(SignatureAlgorithm algorithm) {
    this.algorithm = algorithm;
    return this;
  }

  public JwtTokenBuilder withAlgorithm(SignatureAlgorithm algorithm, Key key) {
    this.algorithm = algorithm;
    this.key = key;
    return this;
  }

  public JwtTokenBuilder withSecret(String secret) {
    this.secret = secret;
    return this;
  }

  public JwtToken build() {
    //issued at -60 seconds to allow for clock drift
    JwtBuilder builder = Jwts.builder().setClaims(claims).setIssuedAt(new Date(System.currentTimeMillis() - 60000)).setExpiration(expiration);
    if(issuer != null) {
      builder = builder.setIssuer(issuer);
    }
    if(subject != null) {
      builder = builder.setSubject(subject);
    }
    if(key != null) {
      return new JwtToken(builder.signWith(algorithm, key).compact(), key);
    } else {
      return new JwtToken(builder.signWith(algorithm, secret).compact(), secret);
    }
  }

}
