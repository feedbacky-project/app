package net.feedbacky.app.data.tag;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.tag.dto.FetchTagDto;

import org.modelmapper.ModelMapper;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 13.10.2019
 */
@Entity
@Table(name = "boards_tags")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Tag implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id")
  private Board board;
  private String name;
  private String color;
  private boolean roadmapIgnored = false;

  public FetchTagDto convertToDto() {
    return new ModelMapper().map(this, FetchTagDto.class);
  }

  public String convertToSpecialCommentMention() {
    return "{data_tag;" + id + ";" + name + ";" + color + "}";
  }

}
