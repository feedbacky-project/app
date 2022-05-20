package net.feedbacky.app.data.board.integration;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.board.dto.integration.FetchIntegrationDto;

import javax.persistence.Column;
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
 * Created at 20.05.2022
 */
@Entity
@Table(name = "boards_integrations")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Integration implements Serializable, Fetchable<FetchIntegrationDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "board_id")
  private Board board;
  private IntegrationType type;
  private String apiKey = "";
  @Column(name = "data", columnDefinition = "text", length = 65_535)
  private String data = "";

  @Override
  public FetchIntegrationDto toDto() {
    return new FetchIntegrationDto().from(this);
  }
}
