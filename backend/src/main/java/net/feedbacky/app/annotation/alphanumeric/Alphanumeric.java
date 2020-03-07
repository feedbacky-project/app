package net.feedbacky.app.annotation.alphanumeric;

import javax.validation.Constraint;
import javax.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Plajer
 * <p>
 * Created at 12.11.2019
 */
@Documented
@Constraint(validatedBy = AlphanumericValidator.class)
@Target( {ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Alphanumeric {

  String message() default "Text must be alphanumeric";

  boolean allowEmpty() default false;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};


}
