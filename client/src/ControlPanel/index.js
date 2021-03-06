import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import { colors } from "ui/constants";

import { UserLogin } from "./UserLogin";
import { UserLogout } from "./UserLogout";

export class ControlPanel extends React.Component {
  state = {
    isUserMode: false,
    userPicUrl: null
  };

  render() {
    return (
      <StyledControlPanel>
        <Button onClick={this.props.resetShift}>
          <span role="img" aria-label="reset">
            🔃
          </span>
        </Button>
        <Button
          onClick={this.props.toggleEditMode}
          isEditMode={this.props.isEditMode}
        >
          <span role="img" aria-label="edit">
            ✏️
          </span>
        </Button>
        <Button onClick={this.toggleUserMode.bind(this)}>
          {this.props.isLoggedIn ? (
            <UserPic src={this.state.userPicUrl} />
          ) : (
            <span role="img" aria-label="reset">
              👤
            </span>
          )}
        </Button>

        {this.state.isUserMode &&
          (this.props.isLoggedIn ? (
            <UserLogout
              closeUserPopup={this.toggleUserMode.bind(this)}
              updateClockList={this.props.updateClockList.bind(this)}
            />
          ) : (
            <UserLogin
              closeUserPopup={this.toggleUserMode.bind(this)}
              updateClockList={this.props.updateClockList.bind(this)}
            />
          ))}
      </StyledControlPanel>
    );
  }

  async componentDidUpdate(prevProps) {
    if (!prevProps.isLoggedIn && this.props.isLoggedIn) {
      const response = await fetch("/auth/userpicurl");
      const userPicUrl = await response.text();
      this.setState({ userPicUrl });
    } else if (prevProps.isLoggedIn && !this.props.isLoggedIn) {
      this.setState({ userPicUrl: null });
    }
  }

  toggleUserMode() {
    this.setState({ isUserMode: !this.state.isUserMode });
  }
}
ControlPanel.propTypes = {
  isEditMode: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  resetShift: PropTypes.func.isRequired,
  updateClockList: PropTypes.func.isRequired
};

const Button = styled.button`
  flex-basis: 33.3%;
  border: none;
  border-top: 1px solid
    ${props => (props.isEditMode ? colors.text : "transparent")};
  background: ${props => (props.isEditMode ? colors.bg : "none")};
  font-size: 20px;
  font-family: monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  cursor: pointer;

  &:active {
    border-top: 1px solid ${colors.text};
    background-color: ${colors.bg};
  }

  &:disabled {
    opacity: 0.4;
  }
`;

const UserPic = styled.img`
  height: 30px;
  border-radius: 50%;
`;

const StyledControlPanel = styled.div`
  position: fixed;
  z-index: 2;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: white;
  display: flex;
`;
