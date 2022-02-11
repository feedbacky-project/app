package net.feedbacky.app.service.user;

import net.feedbacky.app.data.user.dto.FetchConnectedAccount;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.data.user.dto.PatchMailPreferences;
import net.feedbacky.app.data.user.dto.PatchUserDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
public interface UserService {

  FetchUserDto getSelf();

  List<FetchConnectedAccount> getSelfConnectedAccounts();

  FetchUserDto patchSelf(PatchUserDto dto);

  FetchUserDto patchSelfMailPreferences(PatchMailPreferences dto);

  FetchUserDto get(long id);

  ResponseEntity unsubscribe(long id, String code);

  ResponseEntity deactivateSelf();

}
