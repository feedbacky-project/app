package net.feedbacky.app.data.idea.dto.attachment;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.FetchResponseDto;
import net.feedbacky.app.data.idea.attachment.Attachment;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Getter
@Setter
@NoArgsConstructor
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
