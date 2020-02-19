package net.feedbacky.app.rest.data.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.validation.constraints.Email;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.URL;

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

  @Length(min = 3, max = 35, message = "Field 'username' cannot be shorter than 3 or longer than 35 characters.")
  private String username;
  @URL(message = "Field 'avatar' must be a valid URL.")
  private String avatar;
  @Email(message = "Field 'email' must be a valid email.")
  private String email;

}
