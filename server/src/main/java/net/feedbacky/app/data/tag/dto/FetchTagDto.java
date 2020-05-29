package net.feedbacky.app.data.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Plajer
 * <p>
 * Created at 13.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FetchTagDto {

  private String name;
  private String color;
  private boolean roadmapIgnored;

}
