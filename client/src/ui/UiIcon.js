import styled from "@emotion/styled";

export const HoverableIcon = styled.div`
  margin-left: .25rem;
  height: .7rem;
  width: .7rem;
  transition: var(--hover-transition);
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 1rem !important;
  }
  
  &:hover {
    transform: scale(1.2);
  }
`;