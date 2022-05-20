package net.feedbacky.app.data.board.integration;

import net.feedbacky.app.data.trigger.ActionTrigger;

import org.springframework.stereotype.Component;

/**
 * @author Plajer
 * <p>
 * Created at 20.05.2022
 */
@Component
public class IntegrationExecutor {

  public void notifyIntegrations(ActionTrigger trigger) {
    for(Integration integration : trigger.getTriggeredBoard().getIntegrations()) {
      notifyIntegration(integration, trigger);
    }
  }

  private void notifyIntegration(Integration integration, ActionTrigger trigger) {
    for(IntegrationType.IntegrationAction action : integration.getType().getIntegrationActions()) {
      if(action.getTrigger() != trigger.getTrigger()) {
        continue;
      }
      action.getConsumer().accept(trigger, integration);
    }
  }

}
