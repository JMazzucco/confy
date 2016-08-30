import React from 'react';
import { eventTimeString } from 'helpers/DateHelper';
import EventSchema from 'schemas/EventSchema';
import { If } from 'react-if';

import './event.scss';

const defaultCreator = { display_name: 'private', self: false };
const creator = (event) => event.creator || defaultCreator;

const EventDetails = ({ event, timeFormat, showLocation }) => (
  <div>
    <div className="event-time">{eventTimeString(event, timeFormat)}</div>
    <div className="event-name">{event.summary}</div>
    <div className="event-user">
      <small>by&nbsp;</small>
      {creator(event).display_name || creator(event).email}
    </div>
    <If condition={showLocation}>
      <div className="event-location">
        <small>in&nbsp;</small>
        {event.conference_room.title}
      </div>
    </If>
  </div>
);

EventDetails.propTypes = {
  event: EventSchema.isRequired,
  timeFormat: React.PropTypes.string,
  showLocation: React.PropTypes.bool
};

EventDetails.defaultProps = {
  showLocation: true
};

export default EventDetails;
