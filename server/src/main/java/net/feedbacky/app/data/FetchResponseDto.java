package net.feedbacky.app.data;

/**
 * @author Plajer
 * <p>
 * Created at 08.02.2021
 */
public interface FetchResponseDto<K, L> {

  K from(L entity);

}
