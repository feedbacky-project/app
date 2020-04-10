package net.feedbacky.app.service.user;

import net.feedbacky.app.data.board.dto.moderator.FetchUserPermissionDto;
import net.feedbacky.app.data.user.dto.FetchConnectedAccount;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.data.user.dto.PatchUserDto;
import net.feedbacky.app.service.FeedbackyService;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
public interface UserService extends FeedbackyService {

  FetchUserDto getSelf();

  List<FetchConnectedAccount> getSelfConnectedAccounts();

  List<FetchUserPermissionDto> getSelfPermissions();

  FetchUserDto patchSelf(PatchUserDto dto);

  List<FetchUserPermissionDto> getPermissions(long id);

  FetchUserDto get(long id);

  ResponseEntity deactivateSelf();

}
