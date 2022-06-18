package net.feedbacky.app.service.idea.voter;

import net.feedbacky.app.data.idea.dto.PatchVotersDto;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;
import net.feedbacky.app.data.user.dto.FetchUserDto;

import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
public interface VoterService {

  List<FetchSimpleUserDto> getAllVoters(long id);

  List<FetchSimpleUserDto> patchVoters(long id, PatchVotersDto dto);

  FetchUserDto postUpvote(long id, String anonymousId);

  ResponseEntity deleteUpvote(long id, String anonymousId);

}
