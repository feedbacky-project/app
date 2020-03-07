package net.feedbacky.app.annotation.alphanumeric;

import org.apache.commons.lang3.StringUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

/**
 * @author Plajer
 * <p>
 * Created at 12.11.2019
 */
public class AlphanumericValidator implements ConstraintValidator<Alphanumeric, String> {

  private Alphanumeric annotation;

  @Override
  public void initialize(Alphanumeric constraintAnnotation) {
    this.annotation = constraintAnnotation;
  }

  @Override
  public boolean isValid(String field, ConstraintValidatorContext context) {
    if (field == null) {
      return annotation.allowEmpty();
    }
    return isAlphanumericDash(field);
  }

  private boolean isAlphanumericDash(String cs) {
    if (StringUtils.isEmpty(cs)) {
      return false;
    } else {
      int sz = cs.length();

      for (int i = 0; i < sz; ++i) {
        if (!Character.isLetterOrDigit(cs.charAt(i)) && cs.charAt(i) != '-') {
          return false;
        }
      }
      return true;
    }
  }

}
