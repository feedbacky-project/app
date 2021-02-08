package net.feedbacky.app.data.board.dto.social;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.board.social.SocialLink;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Getter
public class FetchSocialLinkDto implements FetchResponseDto<FetchSocialLinkDto, SocialLink> {

  private long id;
  private String logoUrl;
  private String url;

  @Override
  public FetchSocialLinkDto from(SocialLink entity) {
    this.id = entity.getId();
    this.logoUrl = entity.getLogoUrl();
    this.url = entity.getUrl();
    return this;
  }
}
