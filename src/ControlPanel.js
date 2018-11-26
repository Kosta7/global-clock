import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const ControlPanel = ({
  increaseShift,
  decreaseShift,
  resetShift,
  className
}) => (
  <div className={className}>
    <Button onClick={decreaseShift}>–</Button>
    <Button onClick={increaseShift}>+</Button>
    <Button onClick={resetShift}>reset</Button>
  </div>
);
ControlPanel.propTypes = {
  increaseShift: PropTypes.func.isRequired,
  decreaseShift: PropTypes.func.isRequired,
  resetShift: PropTypes.func.isRequired
};

const StyledControlPanel = styled(ControlPanel)`
  position: fixed;
  bottom: 0;
  height: 50px;
  width: 100vw;
  display: flex;
`;

const Button = styled.button`
  flex-grow: 1;
  border: 1px solid transparent;
  border-radius: 3px;
  background: none;
  font-size: 20px;
  margin: 2px;
  outline: none;

  &:active {
    border-color: #f5af5f;
    background-color: #ffe187;
  }
`;

export { StyledControlPanel as ControlPanel };
