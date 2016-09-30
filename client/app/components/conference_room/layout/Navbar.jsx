import React from 'react';
import { Navbar } from 'react-bootstrap';
import ConferenceRoomSchema from 'schemas/ConferenceRoomSchema';

import Clock from 'components/shared/time/Clock';
import Help from '../help/HelpContainer';

import './navbar.scss';

const RoomNavbar = ({ activeConferenceRoom }) => (
  <Navbar style={{ backgroundColor: activeConferenceRoom.color }} className="conference-room-navbar">
    <Navbar.Header>
      <Navbar.Brand>
        <a href="#"><h2>{activeConferenceRoom.title}</h2></a>
      </Navbar.Brand>
      <Navbar.Form pullRight>
        <Help />
      </Navbar.Form>
      <div className="navbar-text pull-right"><h3><Clock dateFormat="MM-DD dddd" timeFormat="HH:mm" /></h3></div>
    </Navbar.Header>
  </Navbar>
);

RoomNavbar.propTypes = {
  activeConferenceRoom: ConferenceRoomSchema.only('color', 'title').isRequired
};

export default RoomNavbar;
