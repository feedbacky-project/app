package net.feedbacky.app.controller.image;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.repository.board.BoardRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;
import net.feedbacky.app.util.objectstorage.ObjectStorage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.util.Optional;

/**
 * @author Plajer
 * <p>
 * Created at 13.11.2021
 */
@CrossOrigin
@Controller
public class OpenGraphImageController {

  private final BoardRepository boardRepository;
  private final IdeaRepository ideaRepository;
  private final ObjectStorage objectStorage;

  @Autowired
  public OpenGraphImageController(BoardRepository boardRepository, IdeaRepository ideaRepository, ObjectStorage objectStorage) {
    this.boardRepository = boardRepository;
    this.ideaRepository = ideaRepository;
    this.objectStorage = objectStorage;
  }

  @GetMapping("v1/openGraph/generator/ba/{name}")
  public byte[] getBoardAdminOpenGraphGenerator(@PathVariable String name) throws IOException {
    return getBoardOpenGraphGenerator(name);
  }

  @GetMapping("v1/openGraph/generator/i/{name}")
  public byte[] getIdeaOpenGraphGenerator(@PathVariable String name) throws IOException {
    String id = name;
    if(name.contains(".")) {
      id = name.split("\\.")[1];
    }
    Optional<Idea> optional = ideaRepository.findById(Long.parseLong(id));
    if(!optional.isPresent()) {
      return new byte[0];
    }
    return getBoardOpenGraphGenerator(optional.get().getBoard().getDiscriminator());
  }

  @GetMapping("v1/openGraph/generator/b/{name}")
  public byte[] getBoardOpenGraphGenerator(@PathVariable String name) throws IOException {
    Optional<Board> optional = boardRepository.findByDiscriminator(name);
    if(!optional.isPresent()) {
      return new byte[0];
    }
    return objectStorage.getImageFromUrl(optional.get().getBanner());
  }

}
