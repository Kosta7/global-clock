import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const DeleteClockButton = ({ deleteClock, className }) => (
  <div onClick={deleteClock} className={className}>
    delete
  </div>
);
DeleteClockButton.propTypes = {
  deleteClock: PropTypes.func.isRequired
};

const StyledDeleteClockButton = styled(DeleteClockButton)`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 2px 4px;
  background: none;
  color: #737dc3;
  outline: none;

  &:active {
    background-color: #ffe187;
  }
`;

export { StyledDeleteClockButton as DeleteClockButton };