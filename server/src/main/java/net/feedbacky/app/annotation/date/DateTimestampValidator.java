package net.feedbacky.app.annotation.date;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @author Plajer
 * <p>
 * Created at 17.11.2020
 */
public class DateTimestampValidator implements ConstraintValidator<DateTimestamp, String> {

  @Override
  public boolean isValid(String value, ConstraintValidatorContext constraintValidatorContext) {
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
    try {
      Date date = format.parse(value);
      return value.equals(format.format(date));
    } catch(ParseException e) {
      return false;
    }
  }

}
