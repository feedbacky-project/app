package net.feedbacky.app.utils.bunnycdn;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Plajer
 * <p>
 * Created at 04.12.2019
 */
public class BCDNObject {

  private long failIndex;
  private String guid;
  private String storageZoneName;
  private String path;
  private String objectName;
  private long length;
  private String lastChanged;
  private String serverID;
  private boolean isDirectory;
  private String userID;
  private String dateCreated;
  private String storageZoneID;

  @JsonProperty("FailIndex")
  public long getFailIndex() {
    return failIndex;
  }

  @JsonProperty("Guid")
  public String getGUID() {
    return guid;
  }

  @JsonProperty("StorageZoneName")
  public String getStorageZoneName() {
    return storageZoneName;
  }

  @JsonProperty("Path")
  public String getPath() {
    return path;
  }

  @JsonProperty("ObjectName")
  public String getObjectName() {
    return objectName;
  }

  @JsonProperty("Length")
  public long getLength() {
    return length;
  }

  @JsonProperty("LastChanged")
  public String getLastChanged() {
    return lastChanged;
  }

  @JsonProperty("ServerId")
  public String getServerID() {
    return serverID;
  }

  @JsonProperty("IsDirectory")
  public boolean getIsDirectory() {
    return isDirectory;
  }

  @JsonProperty("UserId")
  public String getUserID() {
    return userID;
  }

  @JsonProperty("DateCreated")
  public String getDateCreated() {
    return dateCreated;
  }

  @JsonProperty("StorageZoneId")
  public String getStorageZoneID() {
    return storageZoneID;
  }

}
