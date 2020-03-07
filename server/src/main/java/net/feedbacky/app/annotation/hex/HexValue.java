package net.feedbacky.app.annotation.hex;

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
 * Created at 09.10.2019
 */
@Documented
@Constraint(validatedBy = HexValueValidator.class)
@Target( {ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface HexValue {

  String message() default "Invalid hex value";

  boolean allowEmpty() default false;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

}
