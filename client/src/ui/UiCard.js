import styled from "@emotion/styled";
import React from "react";

const StyledCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-clip: border-box;
  box-shadow: var(--box-shadow);
  border-radius: .35rem !important;
  
  .dark & {
    box-shadow: var(--dark-box-shadow) !important;
    background-color: var(--dark-secondary);
  }
`;

const StyledBody = styled.div`
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.25rem;
  @media (max-width: 576px) {
    padding: .9rem .9rem;
  }
`;

const UiCard = (props) => {
    const {className, bodyClassName, bodyAs, children, innerRef, ...otherProps} = props;
    return <StyledCard className={className} ref={innerRef} {...otherProps}>
        <StyledBody as={bodyAs} className={bodyClassName}>
            {children}
        </StyledBody>
    </StyledCard>
};

export {UiCard};