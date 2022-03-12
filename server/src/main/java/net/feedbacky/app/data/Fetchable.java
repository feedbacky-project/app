package net.feedbacky.app.data;

/**
 * @author Plajer
 * <p>
 * Created at 11.03.2022
 */
public interface Fetchable<K extends FetchResponseDto> {

  K toDto();

}
