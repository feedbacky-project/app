import styled from "@emotion/styled";
import React from "react";
import {CirclePicker} from "react-color";

const ColorContainer = styled(CirclePicker)`
  width: 260px !important;
  @media (max-width: 315px) {
    & {
      width: 200px !important;
    }
  }
`;

const ColorPickerContainer = ({className, color, onChange}) => {
    return <ColorContainer colors={["#273c75", "#2c3e50", "#8e44ad", "#B33771",
        "#d35400", "#e74c3c", "#706fd3", "#218c74",
        "#2980b9", "#16a085", "#e67e22", "#27ae60",
        "#44bd32", "#1B9CFC", "#3498db", "#EE5A24"]}
                         className={className} color={color} circleSpacing={4} onChangeComplete={onChange}/>
};

export default ColorPickerContainer;