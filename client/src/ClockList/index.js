import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { addMinutes } from "date-fns";
import { findTimeZone, getZonedTime } from "timezone-support";

import getTimeScale from "./getTimeScale";
import { timeline } from "ui/constants";

import { Clock } from "./Clock";
import { Button } from "ui/Button";
import { AddClockForm } from "./AddClockForm";
import { Hint } from "ui/Hint";

export class ClockList extends React.Component {
  static getDerivedStateFromProps(props, state) {
    if ((props.isLoggedIn || props.isEditMode) && state.isHintShown) {
      return { isHintShown: false };
    }

    return null;
  }

  state = {
    time: new Date(),
    shift: 0,
    timeScale: null,
    isAddClockMode: false,
    isShiftBeingReset: false,
    isHintShown: false
  };

  async componentDidMount() {
    this.props.onRef(this);
    window.addEventListener("resize", this.onWindowResize);
    await this.scrollToNow();

    if (!this.props.isLoggedIn) {
      this.showHint();
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
    window.removeEventListener("resize", this.onWindowResize);
  }

  render() {
    return (
      <ScrollWrapper
        ref={el => (this.scrollWrapper = el)}
        onScroll={this.onScroll.bind(this)}
      >
        <StyledClockList
          ref={el => (this.clockList = el)}
          isEditMode={this.props.isEditMode}
        >
          <Clock
            city={`Local time`}
            time={this.state.time}
            shift={this.state.shift}
            timezoneOffset={getTimezoneOffset(this.state.time)}
            isEditMode={this.props.isEditMode}
            pickTime={this.pickTime.bind(this)}
          />
          {this.props.clockList.map(clock => (
            <Clock
              id={clock.id}
              city={clock.city}
              time={getRemoteTime(this.state.time, clock.timezone)}
              shift={this.state.shift}
              timezoneOffset={getRemoteTimezoneOffset(
                this.state.time,
                clock.timezone
              )}
              isEditMode={this.props.isEditMode}
              deleteClock={this.props.deleteClock.bind(this)}
              pickTime={this.pickTime.bind(this)}
              key={clock.id}
            />
          ))}
          {this.props.isEditMode && (
            <Button left={5} onClick={this.openAddClockForm.bind(this)}>
              add city
            </Button>
          )}
          {this.state.isAddClockMode && (
            <AddClockForm
              onSubmit={this.props.addClock.bind(this)}
              closeForm={this.closeAddClockForm.bind(this)}
            />
          )}
        </StyledClockList>
        {!this.props.isEditMode && <Scrubber />}
        {this.state.isHintShown && <Hint />}
      </ScrollWrapper>
    );
  }

  pickTime(remoteTime, remoteTimezoneOffset) {
    const localTime = getLocalTime(remoteTime, remoteTimezoneOffset);
    this.scrollTo(localTime);
  }

  async scrollTo(time) {
    await this.setState({ time, timeScale: getTimeScale(time) });
    const scaledTime = this.state.timeScale(time);
    const offsetToScrubber = this.scrollWrapper.clientWidth * 0.6;
    this.scrollWrapper.scrollLeft = scaledTime - offsetToScrubber;
  }

  async scrollToNow() {
    await this.setState({ isShiftBeingReset: true });
    this.scrollTo(new Date());
  }

  async scrollToNeighborPeriod(time) {
    await this.setState({ isShiftBeingReset: true });
    await this.scrollTo(time);
  }

  onScroll() {
    const { scrollLeft, clientWidth, scrollWidth } = this.scrollWrapper;
    const offsetToScrubber = clientWidth * 0.6;
    const scrolledPosition = scrollLeft + offsetToScrubber;

    const scrolledTime = this.state.timeScale.invert(scrolledPosition);

    const shift = getShift(this.state.time, scrolledTime);

    this.setState({
      shift: this.state.isShiftBeingReset ? 0 : shift,
      isShiftBeingReset: false
    });

    const isScrolledToEarliest = scrollLeft === 0;
    const isScrolledToLatest = scrollLeft + clientWidth === scrollWidth;
    if (isScrolledToEarliest || isScrolledToLatest) {
      this.scrollToNeighborPeriod(scrolledTime);
    }
  }

  openAddClockForm() {
    this.setState({ isAddClockMode: true });
  }

  closeAddClockForm() {
    this.setState({ isAddClockMode: false });
  }

  showHint() {
    this.setState({ isHintShown: true });
    setTimeout(() => {
      this.scrollWrapper.addEventListener("scroll", this.hideHint);
    });
  }

  onWindowResize = () => {
    this.scrollTo(this.state.time);
  };

  hideHint = () => {
    this.setState({ isHintShown: false });
    this.scrollWrapper.removeEventListener("scroll", this.hideHint);
  };
}
ClockList.propTypes = {
  clockList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      timezone: PropTypes.string.isRequired
    })
  ).isRequired,
  deleteClock: PropTypes.func,
  isEditMode: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool
};

function getTimezoneOffset(time) {
  return -time.getTimezoneOffset();
}

function getRemoteTime(localTime, timezone) {
  const timezoneObj = findTimeZone(timezone);
  const zonedTimeObj = getZonedTime(localTime, timezoneObj);

  return new Date(
    zonedTimeObj.year,
    zonedTimeObj.month - 1,
    zonedTimeObj.day,
    zonedTimeObj.hours,
    zonedTimeObj.minutes,
    zonedTimeObj.seconds,
    zonedTimeObj.milliseconds
  );
}

function getRemoteTimezoneOffset(localTime, timezone) {
  const timezoneObj = findTimeZone(timezone);
  const zonedTimeObj = getZonedTime(localTime, timezoneObj);

  return -zonedTimeObj.zone.offset;
}

function getLocalTime(remoteTime, remoteTimezoneOffset) {
  const localTimezoneOffset = getTimezoneOffset(remoteTime);
  const timezoneOffsetDifference = remoteTimezoneOffset - localTimezoneOffset;
  return addMinutes(remoteTime, -timezoneOffsetDifference);
}

function getShift(time, scrolledTime) {
  return scrolledTime - time;
}

const ScrollWrapper = styled.div`
  min-height: 100vh;
  overflow-x: scroll;
`;

const Scrubber = styled.div`
  position: fixed;
  top: 0;
  left: 60%;
  z-index: 1;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 40%) 80%,
    transparent 100%
  );
  transform: translateX(-50%);
  pointer-events: none;
`;

const StyledClockList = styled.div`
  padding-top: 100px;
  padding-bottom: ${props => (props.isEditMode ? "90" : "50")}px;
  box-sizing: border-box;
  width: calc(100vw * ${timeline.width});
`;
