package net.feedbacky.app.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
public class JwtTokenUtil {

  public static final long JWT_TOKEN_VALIDITY_DAYS = 14;
  private static String secret = System.getenv("SERVER_JWT_SECRET");

  private JwtTokenUtil() {
  }

  public static String getEmailFromToken(String token) {
    return getClaimFromToken(token, Claims::getSubject);
  }

  public static Date getIssuedAtDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getIssuedAt);
  }

  public static Date getExpirationDateFromToken(String token) {
    return getClaimFromToken(token, Claims::getExpiration);
  }

  public static <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = getAllClaimsFromToken(token);
    return claimsResolver.apply(claims);
  }

  private static Claims getAllClaimsFromToken(String token) {
    return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
  }

  private static boolean isTokenExpired(String token) {
    final Date expiration = getExpirationDateFromToken(token);
    return expiration.before(new Date());
  }

  private static boolean ignoreTokenExpiration(String token) {
    return false;
  }

  public static String generateToken(String email) {
    Map<String, Object> claims = new HashMap<>();
    return doGenerateToken(claims, email);
  }

  private static String doGenerateToken(Map<String, Object> claims, String subject) {
    return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + TimeUnit.DAYS.toMillis(JWT_TOKEN_VALIDITY_DAYS)))
            .signWith(SignatureAlgorithm.HS512, secret).compact();
  }

  public static Boolean canTokenBeRefreshed(String token) {
    return (!isTokenExpired(token) || ignoreTokenExpiration(token));
  }

  public static Boolean validateToken(String token, String email) {
    final String tokenEmail = getEmailFromToken(token);
    return (tokenEmail.equals(email) && !isTokenExpired(token));
  }

}
