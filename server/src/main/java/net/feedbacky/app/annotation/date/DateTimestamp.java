package net.feedbacky.app.annotation.date;

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
 * Created at 17.11.2020
 */
@Documented
@Constraint(validatedBy = DateTimestampValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface DateTimestamp {

  String message() default "Invalid timestamp";

  boolean allowEmpty() default false;

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

}
