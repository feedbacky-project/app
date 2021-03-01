package net.feedbacky.app.util;

import org.apache.commons.lang3.math.NumberUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 26.02.2021
 */
public class RequestParamsParser {

  private Map<String, String> params = new HashMap<>();

  public RequestParamsParser(Map<String, String> params) {
    this.params = params;
  }

  public int getPage() {
    if(params.containsKey("page") && NumberUtils.isDigits(params.get("page"))) {
      return Math.max(0, Integer.parseInt(params.get("page")));
    }
    return 0;
  }

  public int getPageSize() {
    if(params.containsKey("pageSize") && NumberUtils.isDigits(params.get("pageSize"))) {
      return Math.max(1, Integer.parseInt(params.get("pageSize")));
    }
    return 20;
  }

}
