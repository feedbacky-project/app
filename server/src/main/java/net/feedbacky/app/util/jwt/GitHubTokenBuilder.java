package net.feedbacky.app.util.jwt;

import io.jsonwebtoken.SignatureAlgorithm;
import lombok.SneakyThrows;
import sun.security.util.DerInputStream;
import sun.security.util.DerValue;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
public class GitHubTokenBuilder {

  private GitHubTokenBuilder() {
  }

  public static JwtToken generateTemporalJwtToken() {
    return new JwtTokenBuilder().withIssuer(System.getenv("INTEGRATION_GITHUB_APP_ID"))
            .withExpirationDate(new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(6)))
            .withAlgorithm(SignatureAlgorithm.RS256, getGitHubSigningKey()).build();
  }

  //thanks to https://stackoverflow.com/a/30929175/10156191
  @SneakyThrows
  public static Key getGitHubSigningKey() {
    String privateKey = System.getenv("INTEGRATION_GITHUB_PRIVATE_KEY");
    privateKey = privateKey.replace("-----BEGIN RSA PRIVATE KEY-----", "")
            .replace("-----END RSA PRIVATE KEY-----", "")
            .replaceAll("\\s", "");
    DerInputStream derReader = new DerInputStream(Base64.getDecoder().decode(privateKey));

    DerValue[] seq = derReader.getSequence(0);

    if(seq.length < 9) {
      throw new GeneralSecurityException("Could not parse a PKCS1 private key.");
    }

    // skip version seq[0];
    BigInteger modulus = seq[1].getBigInteger();
    BigInteger publicExp = seq[2].getBigInteger();
    BigInteger privateExp = seq[3].getBigInteger();
    BigInteger prime1 = seq[4].getBigInteger();
    BigInteger prime2 = seq[5].getBigInteger();
    BigInteger exp1 = seq[6].getBigInteger();
    BigInteger exp2 = seq[7].getBigInteger();
    BigInteger crtCoef = seq[8].getBigInteger();

    RSAPrivateCrtKeySpec keySpec = new RSAPrivateCrtKeySpec(modulus, publicExp, privateExp, prime1, prime2, exp1, exp2, crtCoef);
    KeyFactory factory = KeyFactory.getInstance("RSA");
    return factory.generatePrivate(keySpec);
  }

}
