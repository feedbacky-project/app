import styled from "@emotion/styled";

export const Icon = styled.div`
  height: .7em;
  width: .7em;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 1em !important;
  }
`;

export const HoverableIcon = styled(Icon)`
  transition: var(--hover-transition);
  
  &:hover {
    color: hsla(0,0%,100%,.1) !important;
  }
`;