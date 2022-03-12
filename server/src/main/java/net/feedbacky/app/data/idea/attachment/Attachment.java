package net.feedbacky.app.data.idea.attachment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.feedbacky.app.data.Fetchable;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.dto.attachment.FetchAttachmentDto;

import org.hibernate.annotations.LazyToOne;
import org.hibernate.annotations.LazyToOneOption;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import java.io.Serializable;

/**
 * @author Plajer
 * <p>
 * Created at 20.12.2019
 */
@Entity
@Table(name = "ideas_attachments")
@Getter
@Setter
@NoArgsConstructor
public class Attachment implements Serializable, Fetchable<FetchAttachmentDto> {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String url;
  @ManyToOne(fetch = FetchType.LAZY)
  @LazyToOne(LazyToOneOption.NO_PROXY)
  private Idea idea;

  @Override
  public FetchAttachmentDto toDto() {
    return new FetchAttachmentDto().from(this);
  }
}
