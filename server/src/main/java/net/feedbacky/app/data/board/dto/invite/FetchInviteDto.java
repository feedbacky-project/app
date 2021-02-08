package net.feedbacky.app.data.board.dto.invite;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.invite.Invitation;
import net.feedbacky.app.data.user.dto.FetchSimpleUserDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * @author Plajer
 * <p>
 * Created at 29.11.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FetchInviteDto implements FetchResponseDto<FetchInviteDto, Invitation> {

  private long id;
  private FetchSimpleUserDto user;
  private String code;

  @Override
  public FetchInviteDto from(Invitation entity) {
    this.id = entity.getId();
    this.user = new FetchSimpleUserDto().from(entity.getUser());
    this.code = entity.getCode();
    return this;
  }

}
