package net.feedbacky.app.data.idea.dto.attachment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchAttachmentDto {

  private long id;
  private String url;

}
