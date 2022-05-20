package net.feedbacky.app.data.board.dto.integration;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.integration.Integration;
import net.feedbacky.app.data.board.integration.IntegrationType;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;

import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Getter
public class FetchIntegrationDto implements FetchResponseDto<FetchIntegrationDto, Integration> {

  private long id;
  private IntegrationType integrationType;
  private Map<String, Object> data;

  @Override
  public FetchIntegrationDto from(Integration entity) {
    this.id = entity.getId();
    this.integrationType = entity.getType();
    this.data = null;
    return this;
  }

  public FetchIntegrationDto withConfidentialData(Integration entity, boolean apply) {
    if(apply) {
      ObjectReader reader = new ObjectMapper().readerFor(Map.class);
      try {
        this.data = reader.readValue(entity.getData());
      } catch(JsonProcessingException e) {
        e.printStackTrace();
        this.data = null;
      }
    }
    return this;
  }

}
