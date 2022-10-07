package net.feedbacky.app.util;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.idea.comment.Comment;
import net.feedbacky.app.data.idea.comment.reaction.CommentReaction;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.TagRepository;
import net.feedbacky.app.repository.idea.CommentRepository;
import net.feedbacky.app.repository.idea.IdeaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 07.10.2022
 */
@Component
public class NewBoardPopulator {

  private final UserRepository userRepository;
  private final IdeaRepository ideaRepository;
  private final CommentRepository commentRepository;
  private final TagRepository tagRepository;

  @Autowired
  public NewBoardPopulator(UserRepository userRepository, IdeaRepository ideaRepository, CommentRepository commentRepository, TagRepository tagRepository) {
    this.userRepository = userRepository;
    this.ideaRepository = ideaRepository;
    this.commentRepository = commentRepository;
    this.tagRepository = tagRepository;
  }

  public void doPopulateBoard(Board board) {
    Tag tag = doPopulateTags(board);
    doPopulateIdeas(board, tag);
  }

  private Tag doPopulateTags(Board board) {
    Tag tag = new Tag();
    tag.setBoard(board);
    tag.setColor("#0994f6");
    tag.setName("\uD83D\uDC4B Hello");
    return tagRepository.save(tag);
  }

  private void doPopulateIdeas(Board board, Tag tag) {
    User admin = userRepository.findByServiceStaffTrue().get(0);
    Idea welcome = new Idea();
    welcome.setBoard(board);
    welcome.setTitle("Welcome to Feedbacky");
    welcome.setDescription("Hey " + board.getCreator().getUsername() + " and welcome to your personal `" + board.getName() + "` Board. You can edit it in [Admin Panel](" + board.toAdminPanelViewLink() + ").\n"
            + "You can remove this idea clicking the cog icon above or by clicking `M` letter on your keyboard, you can access all possible Keyboard Shortcuts via CTRL + K.\n\n"
            + "**TIP:** You can use *Markdown* and Emojis here :)");
    welcome.setCreator(admin);
    welcome.setPinned(true);
    welcome.setStatus(Idea.IdeaStatus.OPENED);
    welcome.setMetadata("{}");
    Set<Tag> tags = new HashSet<>();
    tags.add(tag);
    welcome.setTags(tags);
    welcome.setAttachments(new HashSet<>());
    welcome = ideaRepository.save(welcome);
    Set<User> voters = new HashSet<>();
    voters.add(admin);
    welcome.setVoters(voters);
    ideaRepository.save(welcome);
    doPopulateComments(welcome, admin);

    Idea connect = new Idea();
    connect.setBoard(board);
    connect.setTitle("Connect this Board with your Projects");
    connect.setDescription("Enter the [Admin Panel](" + board.toAdminPanelViewLink() + ") and create **Social Links** that link to your Project, Discord server or Patreon page.\n"
            + "Invite **Moderators** to help you manage the board and configure **Integrations** to connect with other services you are using such as GitHub.");
    connect.setCreator(admin);
    connect.setStatus(Idea.IdeaStatus.OPENED);
    connect.setTags(new HashSet<>());
    connect.setAttachments(new HashSet<>());
    connect.setMetadata("{}");
    connect = ideaRepository.save(connect);
    connect.setVoters(voters);
    ideaRepository.save(connect);
  }

  private void doPopulateComments(Idea idea, User admin) {
    Comment comment = new Comment();
    comment.setCreator(admin);
    comment.setDescription("Make sure to use **Discussion** as a way to talk about the feedback you receive.");
    comment.setIdea(idea);
    comment.setReactions(new HashSet<>());
    comment.setMetadata("{}");
    comment.setSpecialType(Comment.SpecialType.LEGACY);
    comment.setViewType(Comment.ViewType.PUBLIC);
    comment = commentRepository.save(comment);

    Comment reply = new Comment();
    reply.setCreator(admin);
    reply.setDescription("It is important to keep contact with your users!");
    reply.setReplyTo(comment);
    reply.setIdea(idea);
    reply.setReactions(new HashSet<>());
    reply.setMetadata("{}");
    reply.setSpecialType(Comment.SpecialType.LEGACY);

    Set<CommentReaction> reactions = new HashSet<>();
    CommentReaction reaction = new CommentReaction();
    reaction.setComment(reply);
    reaction.setUser(admin);
    reaction.setReactionId("like");
    reactions.add(reaction);
    reply.setReactions(reactions);
    commentRepository.save(reply);

    Comment hidden = new Comment();
    hidden.setCreator(admin);
    hidden.setDescription("Want to note something hidden? Just click **Submit Internal** in commenting box to write private comment visible only for Moderators.");
    hidden.setViewType(Comment.ViewType.INTERNAL);
    hidden.setSpecialType(Comment.SpecialType.LEGACY);
    hidden.setIdea(idea);
    hidden.setMetadata("{}");
    hidden.setReactions(new HashSet<>());
    commentRepository.save(hidden);
  }

}
