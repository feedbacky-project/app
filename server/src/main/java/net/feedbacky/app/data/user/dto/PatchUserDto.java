package net.feedbacky.app.data.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.URL;

import javax.validation.constraints.Email;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatchUserDto {

  @Length(min = 3, max = 35, message = "Username cannot be shorter than 3 or longer than 35 characters.")
  private String username;
  @URL(message = "Avatar must be a valid URL.")
  private String avatar;
  @Email(message = "Email must be a valid email.")
  private String email;

}
