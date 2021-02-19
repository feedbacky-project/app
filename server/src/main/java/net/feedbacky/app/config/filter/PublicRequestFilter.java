package net.feedbacky.app.config.filter;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Plajer
 * <p>
 * Created at 19.02.2021
 */
@Component
public class PublicRequestFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getServletPath();
    return !path.startsWith("/v1/public/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String tokenHeader = request.getHeader("Authorization");

    response.setContentType("application/json");
    if(tokenHeader == null) {
      Map<String, Object> error = new HashMap<>();
      error.put("status", HttpStatus.BAD_REQUEST.value());
      error.put("errors", Collections.singletonList("Authorization header required to use Public API."));

      response.setStatus(HttpStatus.BAD_REQUEST.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      ObjectMapper mapper = new ObjectMapper();
      mapper.writeValue(response.getWriter(), error);
      return;
    }
    if(!tokenHeader.startsWith("Apikey ")) {
      Map<String, Object> error = new HashMap<>();
      error.put("status", HttpStatus.BAD_REQUEST.value());
      error.put("errors", Collections.singletonList("Only Apikeys supported in Public API."));

      response.setStatus(HttpStatus.BAD_REQUEST.value());
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      ObjectMapper mapper = new ObjectMapper();
      mapper.writeValue(response.getWriter(), error);
      return;
    }
    chain.doFilter(request, response);
  }

}