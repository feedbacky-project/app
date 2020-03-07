package net.feedbacky.app.annotation.enumvalue;

import javax.validation.Constraint;
import javax.validation.Payload;
import javax.validation.ReportAsSingleViolation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Plajer
 * <p>
 * Created at 26.10.2019
 */
@Documented
@Constraint(validatedBy = EnumValueValidator.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@ReportAsSingleViolation
public @interface EnumValue {

  Class<? extends Enum<?>> enumClazz();

  String message() default "Enum value is not valid";

  boolean allowEmpty() default false;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

}