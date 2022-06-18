package net.feedbacky.app.controller;

import net.feedbacky.app.service.login.LoginService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
@CrossOrigin
@RestController
public class LoginServiceController {

  private final LoginService loginService;

  @Autowired
  public LoginServiceController(LoginService loginService) {
    this.loginService = loginService;
  }

  @GetMapping("v1/service/{id}")
  public ResponseEntity handleLogin(@PathVariable String id, @RequestParam(name = "code") String code) {
    return loginService.handleLogin(id, code);
  }

  @GetMapping("v1/service/magicLink")
  public ResponseEntity handleLogin(@RequestParam(name = "email") String email) {
    return loginService.handleMagicLinkRequest(email);
  }

}
