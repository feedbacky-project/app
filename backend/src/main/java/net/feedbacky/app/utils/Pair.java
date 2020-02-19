package net.feedbacky.app.utils;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * @author Plajer
 * <p>
 * Created at 02.10.2019
 */
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Pair<K, V> implements Serializable {

  private K key;

  private V value;

}