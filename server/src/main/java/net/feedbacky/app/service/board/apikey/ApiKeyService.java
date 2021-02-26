package net.feedbacky.app.service.board.apikey;

import net.feedbacky.app.data.board.dto.FetchBoardDto;

import org.springframework.http.ResponseEntity;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
public interface ApiKeyService {

  ResponseEntity<FetchBoardDto> patch(String discriminator);

  ResponseEntity delete(String discriminator);

}
