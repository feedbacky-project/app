package net.feedbacky.app.data.idea.dto.attachment;

import lombok.Getter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.attachment.Attachment;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Getter
public class FetchAttachmentDto implements FetchResponseDto<FetchAttachmentDto, Attachment> {

  private long id;
  private String url;

  @Override
  public FetchAttachmentDto from(Attachment entity) {
    this.id = entity.getId();
    this.url = entity.getUrl();
    return this;
  }

}
