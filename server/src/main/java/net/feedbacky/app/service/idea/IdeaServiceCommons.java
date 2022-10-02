package net.feedbacky.app.service.idea;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.attachment.Attachment;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.idea.dto.PostIdeaDto;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.trigger.ActionTrigger;
import net.feedbacky.app.data.trigger.ActionTriggerBuilder;
import net.feedbacky.app.data.trigger.TriggerExecutor;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.data.user.dto.FetchUserDto;
import net.feedbacky.app.exception.FeedbackyRestException;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.AttachmentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.util.Base64Util;
import net.feedbacky.app.util.PaginableRequest;
import net.feedbacky.app.util.filter.AdvancedFilterResolver;
import net.feedbacky.app.util.filter.SortFilterResolver;
import net.feedbacky.app.util.objectstorage.ObjectStorage;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphs;

import org.apache.commons.text.StringEscapeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import javax.persistence.EntityGraph;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import java.text.MessageFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@Component
public class IdeaServiceCommons {

  private final IdeaRepository ideaRepository;
  private final ObjectStorage objectStorage;
  private final AttachmentRepository attachmentRepository;
  private final TagRepository tagRepository;
  private final TriggerExecutor triggerExecutor;
  private final AdvancedFilterResolver advancedFilterResolver;
  @PersistenceContext
  private final EntityManager entityManager;

  @Autowired
  public IdeaServiceCommons(IdeaRepository ideaRepository, ObjectStorage objectStorage, AttachmentRepository attachmentRepository, TagRepository tagRepository,
                            TriggerExecutor triggerExecutor, AdvancedFilterResolver advancedFilterResolver, EntityManager entityManager) {
    this.ideaRepository = ideaRepository;
    this.objectStorage = objectStorage;
    this.attachmentRepository = attachmentRepository;
    this.tagRepository = tagRepository;
    this.triggerExecutor = triggerExecutor;
    this.advancedFilterResolver = advancedFilterResolver;
    this.entityManager = entityManager;
  }

  public PaginableRequest<List<FetchIdeaDto>> getAllIdeasByFilterQuery(Board board, User user, int page, int pageSize, String filterQuery, IdeaService.SortType sort) {
    AdvancedFilterResolver.AdvancedFilters filters = advancedFilterResolver.resolveFilters(filterQuery);

    String orderParams = " ORDER BY i.pinned DESC, " + sort.getOrderSqlPart();
    Query query = entityManager.createQuery("SELECT i FROM Idea i LEFT JOIN i.tags ideaTags WHERE i.board = :board " + filters.generateSqlQueryPart() + orderParams)
            .setParameter("board", board)
            .setHint("javax.persistence.fetchgraph", entityManager.getEntityGraph("Idea.fetch"));
    Query queryTotal = entityManager.createQuery("SELECT COUNT(i.id) FROM Idea i LEFT JOIN i.tags ideaTags WHERE i.board = :board " + filters.generateSqlQueryPart())
            .setParameter("board", board);

    if(filters.getByText() != null) {
      query = query.setParameter("text", filters.getByText());
      queryTotal = queryTotal.setParameter("text", filters.getByText());
    }
    if(filters.getByStatus() != null) {
      query = query.setParameter("status", filters.getByStatus());
      queryTotal = queryTotal.setParameter("status", filters.getByStatus());
    }
    if(filters.getByTags() != null) {
      query = query.setParameter("tags", filters.getByTags());
      queryTotal = queryTotal.setParameter("tags", filters.getByTags());
    }
    if(filters.getByVotersAmount() != null) {
      query = query.setParameter("votersAmount", filters.getByVotersAmount().getRight());
      queryTotal = queryTotal.setParameter("votersAmount", filters.getByVotersAmount().getRight());
    }

    query.setFirstResult(page * pageSize);
    query.setMaxResults(pageSize);
    List<Idea> ideaData = query.getResultList();

    long countResult = (long) queryTotal.getSingleResult();
    int totalPages = (int) (countResult / pageSize);

    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideaData.stream()
            .map(idea -> idea.toDto().withUser(idea, user)).collect(Collectors.toList()));
  }

  public PaginableRequest<List<FetchIdeaDto>> getAllIdeas(Board board, User user, int page, int pageSize, IdeaService.FilterType filter, IdeaService.SortType sort) {
    //not using board.getIdeas() because it would load all, we need paged limited list
    long queryTime = System.currentTimeMillis();
    Page<Idea> pageData;
    switch(filter.getType()) {
      case OPENED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.OPENED, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      case CLOSED:
        pageData = ideaRepository.findByBoardAndStatus(board, Idea.IdeaStatus.CLOSED, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      case ALL:
        pageData = ideaRepository.findByBoard(board, PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      case TAG:
        Tag tag = tagRepository.findById(filter.getValue()).orElseThrow(() -> new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid filter tag type."));
        pageData = ideaRepository.findByBoardAndTagsIn(board, Collections.singletonList(tag), PageRequest.of(page, pageSize, SortFilterResolver.resolveIdeaSorting(sort)));
        break;
      default:
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Invalid filter type.");
    }
    List<Idea> ideas = pageData.getContent();
    int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
    System.out.println("query time " + (System.currentTimeMillis() - queryTime) + "ms");
    return new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), ideas.stream()
            .map(idea -> idea.toDto().withUser(idea, user)).collect(Collectors.toList()));
  }

  public FetchIdeaDto getOne(User user, long id) {
    Idea idea = ideaRepository.findById(id, EntityGraphs.named("Idea.fetch"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Idea with id {0} not found.", id)));
    return idea.toDto().withUser(idea, user);
  }

  public FetchIdeaDto post(PostIdeaDto dto, Board board, User user) {
    Optional<Idea> optional = ideaRepository.findByTitleAndBoard(dto.getTitle(), board);
    if(optional.isPresent() && optional.get().getBoard().getId().equals(board.getId())) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Idea with that title already exists.");
    }
    if(board.getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<Tag> tags = new HashSet<>();
    for(long tagId : dto.getTags()) {
      Tag tag = tagRepository.getOne(tagId);
      if(!tag.getBoard().equals(board)) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Tag {0} not found.", tag.getName()));
      }
      if(!tag.isPublicUse()) {
        throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, MessageFormat.format("Tag {0} is private.", tag.getName()));
      }
      tags.add(tag);
    }
    Idea idea = new Idea();
    idea.setId(null);
    idea.setBoard(board);
    idea.setCreator(user);
    idea.setCreationDate(Calendar.getInstance().getTime());
    Set<User> set = new HashSet<>();
    set.add(user);
    idea.setVoters(set);
    idea.setTags(tags);
    idea.setStatus(Idea.IdeaStatus.OPENED);
    idea.setTitle(dto.getTitle());
    idea.setDescription(StringEscapeUtils.escapeHtml4(dto.getDescription()));
    idea.setSubscribers(set);
    idea.setMetadata("{}");
    idea = ideaRepository.save(idea);

    //must save idea first in order to apply and save attachment
    Set<Attachment> attachments = new HashSet<>();
    if(dto.getAttachment() != null) {
      String link = objectStorage.storeImage(Base64Util.extractBase64Data(dto.getAttachment()), ObjectStorage.ImageType.ATTACHMENT);
      Attachment attachment = new Attachment();
      attachment.setIdea(idea);
      attachment.setUrl(link);
      attachment = attachmentRepository.save(attachment);
      attachments.add(attachment);
    }
    idea.setAttachments(attachments);
    idea = ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_CREATE)
            .withBoard(board)
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    return new FetchIdeaDto().from(idea).withUser(idea, user);
  }

  public FetchUserDto postUpvote(User user, Idea idea) {
    if(idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Already upvoted.");
    }
    if(!user.isFake() && idea.getBoard().getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<User> voters = idea.getVoters();
    voters.add(user);
    idea.setVoters(voters);
    ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_UPVOTE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    return user.toDto();
  }

  public ResponseEntity deleteUpvote(User user, Idea idea) {
    if(!idea.getVoters().contains(user)) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "Not yet upvoted.");
    }
    if(!user.isFake() && idea.getBoard().getSuspensedList().stream().anyMatch(suspended -> suspended.getUser().equals(user))) {
      throw new FeedbackyRestException(HttpStatus.BAD_REQUEST, "You've been suspended, please contact board owner for more information.");
    }
    Set<User> voters = idea.getVoters();
    voters.remove(user);
    idea.setVoters(voters);
    ideaRepository.save(idea);

    triggerExecutor.executeTrigger(new ActionTriggerBuilder()
            .withTrigger(ActionTrigger.Trigger.IDEA_UNDO_UPVOTE)
            .withBoard(idea.getBoard())
            .withTriggerer(user)
            .withRelatedObjects(idea)
            .build()
    );
    return ResponseEntity.noContent().build();
  }

}
