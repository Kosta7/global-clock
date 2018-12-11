import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Popup = ({ closePopup, children, className }) => {
  let popup = null;
  const closePopupHandler = event => {
    if (!popup.contains(event.target)) {
      closePopup();
    }
  };

  return (
    <Background onClick={closePopupHandler}>
      <div ref={el => (popup = el)} className={className}>
        {children}
      </div>
    </Background>
  );
};
Popup.propTypes = {
  closePopup: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

const Background = styled.div`
  position: fixed;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(192, 192, 192, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledPopup = styled(Popup)`
  width: 80%;
  max-width: 400px;
  max-height: 70%;
  background-color: white;
  padding: 10px 5px;
  overflow-y: auto;
`;

export { StyledPopup as Popup };
