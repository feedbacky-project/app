package net.feedbacky.app.controller.user;

import net.feedbacky.app.data.user.dto.FetchConnectedAccount;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.data.user.dto.PatchMailPreferences;
import net.feedbacky.app.data.user.dto.PatchUserDto;
import net.feedbacky.app.service.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 02.10.2019
 */
@CrossOrigin
@RestController
public class UserRestController {

  private final UserService userService;

  @Autowired
  public UserRestController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("v1/users/@me/connectedAccounts")
  public List<FetchConnectedAccount> getSelfConnectedAccounts() {
    return userService.getSelfConnectedAccounts();
  }

  @GetMapping("v1/users/@me")
  public FetchUserDto getSelf() {
    return userService.getSelf();
  }

  @GetMapping("v1/users/{id}")
  public FetchUserDto get(@PathVariable long id) {
    return userService.get(id);
  }

  @PatchMapping("v1/users/@me")
  public FetchUserDto patchSelf(@Valid @RequestBody PatchUserDto dto) {
    return userService.patchSelf(dto);
  }

  @PatchMapping("v1/users/@me/mailPreferences")
  public FetchUserDto patchSelfMailPreferences(@Valid @RequestBody PatchMailPreferences dto) {
    return userService.patchSelfMailPreferences(dto);
  }

  @DeleteMapping("v1/users/{id}/unsubscribe/{code}")
  public ResponseEntity unsubscribe(@PathVariable long id, @PathVariable String code) {
    return userService.unsubscribe(id, code);
  }

  @DeleteMapping("v1/users/@me")
  public ResponseEntity deactivateSelf() {
    return userService.deactivateSelf();
  }

}
