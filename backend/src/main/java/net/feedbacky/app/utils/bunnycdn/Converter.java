package net.feedbacky.app.utils.bunnycdn;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.ObjectWriter;

import java.io.IOException;

/**
 * @author Plajer
 * <p>
 * Created at 04.12.2019
 */
public class Converter {
  // Serialize/deserialize helpers

  public static BCDNObject[] fromJsonString(String json) throws IOException {
    return getObjectReader().readValue(json);
  }

  public static String toJsonString(BCDNObject[] obj) throws JsonProcessingException {
    return getObjectWriter().writeValueAsString(obj);
  }

  private static ObjectReader reader;
  private static ObjectWriter writer;

  private static void instantiateMapper() {
    ObjectMapper mapper = new ObjectMapper();
    reader = mapper.reader(BCDNObject[].class);
    writer = mapper.writerFor(BCDNObject[].class);
  }

  private static ObjectReader getObjectReader() {
    if (reader == null) instantiateMapper();
    return reader;
  }

  private static ObjectWriter getObjectWriter() {
    if (writer == null) instantiateMapper();
    return writer;
  }
}
