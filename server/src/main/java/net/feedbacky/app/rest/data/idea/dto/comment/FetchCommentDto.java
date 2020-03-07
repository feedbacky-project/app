package net.feedbacky.app.rest.data.idea.dto.comment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.rest.data.user.dto.FetchSimpleUserDto;

import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 11.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchCommentDto {

  private long id;
  private FetchSimpleUserDto user;
  private String description;
  private boolean special;
  private String specialType;
  private int likesAmount;
  private boolean liked;
  private Date creationDate;

}
