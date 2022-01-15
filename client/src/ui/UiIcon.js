import styled from "@emotion/styled";

export const Icon = styled.div`
  height: .75em;
  width: .75em;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 1em !important;
  }
`;

export const HoverableIcon = styled(Icon)`
  transition: var(--hover-transition);
  
  &:hover {
    color: hsl(0, 0%, 0%) !important;
  }
  .dark &:hover {
    color: hsl(0, 0%, 95%) !important;
  }
`;