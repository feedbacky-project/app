package net.feedbacky.app.annotation.hex;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Plajer
 * <p>
 * Created at 09.10.2019
 */
public class HexValueValidator implements ConstraintValidator<HexValue, String> {

  private final Pattern hexPattern = Pattern.compile("#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})");
  private HexValue annotation;

  @Override
  public void initialize(HexValue constraintAnnotation) {
    this.annotation = constraintAnnotation;
  }

  @Override
  public boolean isValid(String field, ConstraintValidatorContext context) {
    if (field == null || field.equals("")) {
      return annotation.allowEmpty();
    }
    Matcher m = hexPattern.matcher(field);
    return m.matches();
  }

}
