package net.feedbacky.app.annotation.base64;

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
 * Created at 10.10.2019
 */
@Documented
@Constraint(validatedBy = Base64ValueValidator.class)
@Target( {ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Base64 {

  String message() default "Invalid base64 value";

  int maximumKbSize() default 400;

  String[] mimeType();

  boolean allowEmpty() default false;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

}
