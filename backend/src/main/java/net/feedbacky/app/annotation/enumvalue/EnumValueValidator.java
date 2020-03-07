package net.feedbacky.app.annotation.enumvalue;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
public class EnumValueValidator implements ConstraintValidator<EnumValue, String> {

  private List<String> valueList = null;
  private EnumValue annotation;

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if(value == null) {
      return annotation.allowEmpty();
    }
    return valueList.contains(value.toUpperCase());
  }

  @Override
  public void initialize(EnumValue constraintAnnotation) {
    this.annotation = constraintAnnotation;
    valueList = new ArrayList<>();
    Class<? extends Enum<?>> enumClass = constraintAnnotation.enumClazz();

    Enum[] enumValArr = enumClass.getEnumConstants();

    for(Enum enumVal : enumValArr) {
      valueList.add(enumVal.toString().toUpperCase());
    }

  }

}
