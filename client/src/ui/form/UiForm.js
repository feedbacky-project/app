import styled from "@emotion/styled";

const Label = styled.div`
  color: hsla(0, 0%, 0%, .75);
  margin-bottom: .5rem;
  display: inline-block;
  
  .dark & {
    color: hsla(0, 0%, 95%, .75);
  }
`;

const Text = styled.small`
  color: hsla(0, 0%, 0%, .6);
  display: block;
  margin-top: .25rem;
  
  .dark & {
    color: hsla(0, 0%, 95%, .6) !important;
  }
`;

export {Label, Text};