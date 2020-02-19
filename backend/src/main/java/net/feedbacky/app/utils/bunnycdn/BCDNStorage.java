package net.feedbacky.app.utils.bunnycdn;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.file.Files;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * @author Plajer
 * <p>
 * Created at 04.12.2019
 */
@Component
public class BCDNStorage {

  private String VERSION = "1.0.0";
  private String BASE_URL = "https://storage.bunnycdn.com";
  @Value("${bunnycdn.zone-name}") private String nameOfZone;
  @Value("${bunnycdn.api-key}") private String apiKey;

  public void uploadObject(File file, String remotePath) throws Exception {
    String toReturn = "";
    try {
      toReturn = sendRequest(normalizePath(remotePath), "PUT", file, false, "");
    } catch (Exception e) {
      if ((e + "").contains("FileNotFound")) {
        // Sub. old exception with the exception below
        throw new Exception("File/Folder Not Found");
      } else if ((e + "").contains("Invalid Path")) {
        // Sub. old exception
        throw new Exception("Invalid Path (remote)");
      } else {
        // Forward any other exceptions
        throw new Exception(e);
      }
    }
  }

  public BCDNObject[] getStorageObjects(String remotePath) throws Exception {
    String toReturn = "";
    try {
      // Send request
      toReturn = sendRequest(normalizePath(remotePath), "GET", null, false, "");
    } catch (Exception e) {
      if ((e + "").contains("FileNotFound")) {
        // Sub. old exception with the exception below
        throw new Exception("File/Folder Not Found");
      } else {
        // Forward any other exceptions
        throw new Exception(e);
      }
    }
    return Converter.fromJsonString(toReturn);
  }

  public void deleteObject(String remotePath) throws Exception {
    String toReturn = "";
    try {
      toReturn = sendRequest(normalizePath(remotePath), "DELETE", null, false, "");
    } catch (Exception e) {
      throw new Exception(e);
    }
  }

  public void downloadObject(String remotePath, String localPath) throws Exception {
    String toReturn = "";
    try {
      toReturn = sendRequest(normalizePath(remotePath), "GET", null, true, localPath);
    } catch (Exception e) {
      if ((e + "").contains("FileNotFound")) {
        throw new Exception("File/Folder Not Found");
      } else {
        throw new Exception(e);
      }
    }
  }

  private String normalizePath(String path) {
    if (path.length() > 0) {
      if ((path.charAt(0) + "").equals("/")) {
        return path.replaceFirst("/", "");
      }
    }
    return path;
  }

  private String sendRequest(String url, String method, File arg, boolean arg2, String arg3) throws Exception {
    // Declarations
    String inputLine;
    BufferedReader in;
    StringBuffer resp = new StringBuffer();
    HttpsURLConnection req = (HttpsURLConnection) (new URL(BASE_URL + "/" + nameOfZone + "/" + url)).openConnection();
    req.setRequestMethod(method);
    // For analytical purposes
    req.setRequestProperty("User-Agent", "Java-BCDN-Client-" + VERSION);
    // Authentication Bearer
    req.setRequestProperty("AccessKey", apiKey);
    // Handle upload/delete
    req.setDoOutput(true);
    switch (method) {
      case "PUT":
        req.setRequestProperty("Accept", "*/*");
        req.setDoInput(true);
        req.connect();

        //custom fix applied here
        BufferedOutputStream os = new BufferedOutputStream(req.getOutputStream());
        os.write(Files.readAllBytes(arg.toPath()));
        os.close();
        break;
      case "DELETE":
        req.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        resp.append("");
        break;
      case "GET":
        if (arg2) {
          FileOutputStream fs = new FileOutputStream(arg3);
          int bytesRead = -1;
          byte[] buffer = new byte[4096];
          while ((bytesRead = req.getInputStream().read(buffer)) != -1) {
            fs.write(buffer, 0, bytesRead);
          }
        } else {
          in = new BufferedReader(new InputStreamReader(req.getInputStream()));
          while ((inputLine = in.readLine()) != null) {
            resp.append(inputLine);
          }
          in.close();
        }
        break;
    }
    // 400 -> Bad Request, 401 -> Authentication Failed, 500 -> Server Error
    switch (req.getResponseCode()) {
      case 400:
        throw new Exception("Invalid Path");
      case 401:
        throw new Exception("Unauthorized");
      case 500:
        throw new Exception("Server Error");
    }
    return resp.toString();
  }

}
