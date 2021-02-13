package net.feedbacky.app.service.board.roadmap;

import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.dto.FetchIdeaDto;
import net.feedbacky.app.data.roadmap.FetchRoadmapElement;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.tag.dto.FetchTagDto;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.exception.types.ResourceNotFoundException;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.PaginableRequest;

import com.cosium.spring.data.jpa.entity.graph.domain.EntityGraphUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Plajer
 * <p>
 * Created at 28.05.2020
 */
@Service
public class RoadmapServiceImpl implements RoadmapService {

  private final BoardRepository boardRepository;
  private final UserRepository userRepository;
  private final IdeaRepository ideaRepository;

  @Autowired
  public RoadmapServiceImpl(BoardRepository boardRepository, UserRepository userRepository, IdeaRepository ideaRepository) {
    this.boardRepository = boardRepository;
    this.userRepository = userRepository;
    this.ideaRepository = ideaRepository;
  }

  @Override
  public List<FetchRoadmapElement> getAll(String discriminator, int page, int pageSize) {
    User user = null;
    if(SecurityContextHolder.getContext().getAuthentication() instanceof UserAuthenticationToken) {
      UserAuthenticationToken auth = (UserAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
      user = userRepository.findByEmail(((ServiceUser) auth.getPrincipal()).getEmail()).orElse(null);
    }
    final User finalUser = user;
    Board board = boardRepository.findByDiscriminator(discriminator, EntityGraphUtils.fromAttributePaths("tags"))
            .orElseThrow(() -> new ResourceNotFoundException(MessageFormat.format("Board {0} not found.", discriminator)));
    List<FetchRoadmapElement> elements = new ArrayList<>();
    for(Tag tag : board.getTags()) {
      if(tag.isRoadmapIgnored()) {
        continue;
      }
      FetchRoadmapElement element = new FetchRoadmapElement();
      element.setTag(new FetchTagDto().from(tag));
      Page<Idea> pageData = ideaRepository.findByBoardAndTagsInAndStatus(board, Collections.singletonList(tag), Idea.IdeaStatus.OPENED, PageRequest.of(page, pageSize, Sort.by("votersAmount").descending()));
      List<Idea> ideas = pageData.getContent();
      int totalPages = pageData.getTotalElements() == 0 ? 0 : pageData.getTotalPages() - 1;
      List<FetchIdeaDto> dtos = ideas.stream().map(idea -> new FetchIdeaDto().from(idea).withUser(idea, finalUser)).collect(Collectors.toList());
      element.setIdeas(new PaginableRequest<>(new PaginableRequest.PageMetadata(page, totalPages, pageSize), dtos));
      elements.add(element);
    }
    return elements;
  }

}
