package net.feedbacky.app.annotation.base64;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.springframework.beans.factory.annotation.Autowired;

import net.feedbacky.app.utils.Base64Utils;

/**
 * @author Plajer
 * <p>
 * Created at 10.10.2019
 */
public class Base64ValueValidator implements ConstraintValidator<Base64, String> {

  @Autowired private Base64Utils base64Utils;
  private Pattern base64Pattern = Pattern.compile("^(.*?)([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$");
  private Base64 annotation;

  @Override
  public void initialize(Base64 constraintAnnotation) {
    this.annotation = constraintAnnotation;
  }

  @Override
  public boolean isValid(String field, ConstraintValidatorContext context) {
    if (field == null) {
      return annotation.allowEmpty();
    }
    Matcher m = base64Pattern.matcher(field);
    if (!m.matches()) {
      return false;
    }
    if (!Arrays.asList(annotation.mimeType()).contains(base64Utils.extractMimeType(field)) ||
        base64Utils.calculateBase64DataSizeInKb(base64Utils.extractBase64Data(field)) > annotation.maximumKbSize()) {
      return false;
    }
    return true;
  }

}