package net.feedbacky.app.util.filter;

import lombok.Getter;
import lombok.Setter;
import net.feedbacky.app.data.idea.Idea;
import net.feedbacky.app.data.tag.Tag;
import net.feedbacky.app.data.user.User;
import net.feedbacky.app.repository.UserRepository;
import net.feedbacky.app.repository.board.TagRepository;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Plajer
 * <p>
 * Created at 31.08.2022
 */
@Component
public class AdvancedFilterResolver {

  private final UserRepository userRepository;
  private final TagRepository tagRepository;

  @Autowired
  public AdvancedFilterResolver(UserRepository userRepository, TagRepository tagRepository) {
    this.userRepository = userRepository;
    this.tagRepository = tagRepository;
  }

  public AdvancedFilters resolveFilters(String filterQuery) {
    String[] data = filterQuery.split(";");
    AdvancedFilters advancedFilters = new AdvancedFilters();
    for(String preDataPart : data) {
      String[] dataPart = preDataPart.split(":");
      //corrupted or invalid filter data, skip it
      if(dataPart.length != 2) {
        continue;
      }
      switch(dataPart[0]) {
        case "text":
          advancedFilters.setByText(dataPart[1]);
          break;
        case "tags":
          String[] separatedTags = dataPart[1].split(",");
          Set<Tag> tags = new HashSet<>();
          for(String tagData : separatedTags) {
            try {
              long tagId = Long.parseLong(tagData);
              tagRepository.findById(tagId).ifPresent(tags::add);
            } catch(Exception ignored) {
              //if invalid value skip it
            }
          }
          advancedFilters.setByTags(tags);
          break;
        case "users":
          String[] separatedUsers = dataPart[1].split(",");
          Set<User> users = new HashSet<>();
          for(String userData : separatedUsers) {
            try {
              long userId = Long.parseLong(userData);
              userRepository.findById(userId).ifPresent(users::add);
            } catch(Exception ignored) {
            }
          }
          advancedFilters.setByUsers(users);
          break;
        case "status":
          try {
            Idea.IdeaStatus status = Idea.IdeaStatus.valueOf(dataPart[1].toUpperCase());
            advancedFilters.setByStatus(status);
          } catch(Exception ignored) {
          }
          break;
        case "voters":
          String[] votersData = dataPart[1].split(",");
          if(votersData.length != 2) {
            break;
          }
          try {
            AdvancedFilters.LogicalType logicalType = AdvancedFilters.LogicalType.valueOf(votersData[0].toUpperCase());
            Integer value = Integer.parseInt(votersData[1]);
            advancedFilters.setByVotersAmount(Pair.of(logicalType, value));
          } catch(Exception ignored) {
          }
          break;
      }
    }
    return advancedFilters;
  }

  @Getter
  @Setter
  public static class AdvancedFilters {

    private String byText;
    private Set<Tag> byTags;
    private Set<User> byUsers;
    private Idea.IdeaStatus byStatus;
    private Pair<LogicalType, Integer> byVotersAmount;

    public String generateSqlQueryPart() {
      StringBuilder builder = new StringBuilder();
      if(byText != null) {
        builder.append(" (i.title LIKE  '%' || :text || '%' OR i.description LIKE  '%' || :text || '%') ");
      }
      if(byStatus != null) {
        if(!builder.toString().isEmpty()) {
          builder.append(" AND ");
        }
        builder.append(" i.status = :status ");
      }
      if(byTags != null) {
        if(!builder.toString().isEmpty()) {
          builder.append(" AND ");
        }
        builder.append(" ideaTags IN :tags");
      }
      if(byVotersAmount != null) {
        if(!builder.toString().isEmpty()) {
          builder.append(" AND ");
        }
        builder.append("i.votersAmount ").append(byVotersAmount.getLeft().getSelector()).append(" :votersAmount ");
      }
      String searchParams = builder.toString();
      //don't include invalid empty SQL query
      if(searchParams.isEmpty()) {
        return "";
      }
      return " AND " + searchParams;
    }

    @Getter
    public enum LogicalType {
      BELOW("<"), ABOVE(">");

      private String selector;

      LogicalType(String selector) {
        this.selector = selector;
      }
    }

  }

}
