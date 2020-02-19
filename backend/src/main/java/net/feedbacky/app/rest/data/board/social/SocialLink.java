package net.feedbacky.app.rest.data.board.social;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.modelmapper.ModelMapper;

import net.feedbacky.app.rest.data.board.Board;
import net.feedbacky.app.rest.data.board.dto.social.FetchSocialLinkDto;

/**
 * @author Plajer
 * <p>
 * Created at 23.12.2019
 */
@Entity
@Table(name = "boards_social_links")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SocialLink implements Serializable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "board_id")
  private Board board;
  private String logoUrl;
  private String url;

  public FetchSocialLinkDto convertToDto() {
    return new ModelMapper().map(this, FetchSocialLinkDto.class);
  }

}
