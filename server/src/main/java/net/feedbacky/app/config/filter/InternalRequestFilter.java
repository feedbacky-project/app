package net.feedbacky.app.config.filter;

import io.jsonwebtoken.JwtException;
import net.feedbacky.app.config.UserAuthenticationToken;
import net.feedbacky.app.service.FeedbackyUserDetailsService;
import net.feedbacky.app.service.ServiceUser;
import net.feedbacky.app.util.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * @author Plajer
 * <p>
 * Created at 01.10.2019
 */
@Component
public class InternalRequestFilter extends OncePerRequestFilter {

  private final FeedbackyUserDetailsService userDetailsService;

  @Autowired
  public InternalRequestFilter(FeedbackyUserDetailsService userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getServletPath();
    return !path.startsWith("/v1/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String tokenHeader = request.getHeader("Authorization");

    response.setContentType("application/json");
    if(tokenHeader == null) {
      chain.doFilter(request, response);
      return;
    }
    if(tokenHeader.startsWith("Bearer ")) {
      String jwtToken = tokenHeader.substring(7);
      String email = getEmailFromToken(jwtToken);
      //don't reply with errors, just ignore broken bearer because it's Feedbacky UI component
      //API keys would require clear message with error instead
      if(email == null) {
        chain.doFilter(request, response);
        return;
      }
      if(SecurityContextHolder.getContext().getAuthentication() instanceof AnonymousAuthenticationToken
              && JwtTokenUtil.validateToken(jwtToken, email)) {
        ServiceUser serviceUser = userDetailsService.loadUserByEmail(email);
        UserAuthenticationToken userAuthenticationToken = new UserAuthenticationToken(serviceUser, null, serviceUser.getAuthorities());
        userAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(userAuthenticationToken);
      }
    } else if(tokenHeader.startsWith("Apikey ")) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Apikeys not yet supported.");
      return;
    }
    chain.doFilter(request, response);
  }

  private String getEmailFromToken(String jwtToken) {
    try {
      return JwtTokenUtil.getEmailFromToken(jwtToken);
    } catch(JwtException ex) {
      return null;
    }
  }

}
