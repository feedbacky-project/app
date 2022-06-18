package net.feedbacky.app.data.trigger;

import net.feedbacky.app.data.board.Board;
import net.feedbacky.app.data.user.User;

import org.apache.commons.lang3.Validate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Action trigger builder will build ActionTrigger and validate objects provided into relatedObjects
 *
 * @author Plajer
 * <p>
 * Created at 16.02.2022
 */
public class ActionTriggerBuilder {

  private ActionTrigger.Trigger trigger;
  private User triggerer;
  private Board board;
  private List<Object> relatedObjects = new ArrayList<>();

  public ActionTriggerBuilder withTrigger(ActionTrigger.Trigger trigger) {
    this.trigger = trigger;
    return this;
  }

  public ActionTriggerBuilder withTriggerer(User user) {
    this.triggerer = user;
    return this;
  }

  public ActionTriggerBuilder withBoard(Board board) {
    this.board = board;
    return this;
  }

  public ActionTriggerBuilder withRelatedObjects(Object... object) {
    relatedObjects.addAll(new ArrayList<>(Arrays.asList(object)));
    return this;
  }

  public ActionTrigger build() {
    Validate.notNull(trigger, "Trigger cannot be null");
    Validate.notNull(triggerer, "Triggerer cannot be null");
    Validate.notNull(board, "Board cannot be null");
    validateObjects();
    return new ActionTrigger(trigger, board, triggerer, relatedObjects);
  }

  private void validateObjects() {
    int currentObjects = relatedObjects.size();
    for(Object obj : relatedObjects) {
      if(!trigger.containsObject(obj)) {
        throw new IllegalArgumentException("Invalid object '" + obj.getClass().getSimpleName() + "' provided to related objects. Make sure Trigger.triggerClasses are same as relatedObjects");
      }
    }
    if(trigger.getTriggerClasses().length != currentObjects) {
      throw new IllegalArgumentException("Invalid objects amount provided to related objects. Make sure Trigger.triggerClasses are same amount as relatedObjects");
    }
  }

}
