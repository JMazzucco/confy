import React from 'react';
import { instanceOfMoment } from 'proptypes/moment';
import { Row, Col, Accordion, Panel } from 'react-bootstrap';
import EventSchema from 'proptypes/schemas/EventSchema';
import ConferenceRoomSchema from 'proptypes/schemas/ConferenceRoomSchema';
import RoomsAvailability from 'components/conference_room/availability/RoomsAvailability';
import CurrentEvent from '../event/CurrentEvent';
import NextEvents from '../event/NextEvents';
import texts from '../texts/texts';

import './current_next_events.scss';

const CurrentAndNextEvents = ({
  currentEvent,
  nextEvents,
  nextEventStart,
  onUpdate,
  onConfirm,
  onFinish,
  onCreate,
  onCancel,
  activeConferenceRoom,
  allConferenceRooms,
  allEvents,
  onExtend
}) => (
  <Row>
    <Col xs={12} sm={7}>
      <CurrentEvent event={currentEvent}
                    nextEventStart={nextEventStart}
                    onCompleted={onUpdate}
                    onConfirm={onConfirm}
                    onFinish={onFinish}
                    onCreate={onCreate}
                    onCancel={onCancel}
                    onExtend={onExtend} />
    </Col>
    <Col xs={12} sm={5}>
      <Accordion className="side-accordion" defaultActiveKey="1">
        <Panel header="Next events" eventKey="1">
          <NextEvents events={nextEvents} noEventLabel={texts.NO_MORE_EVENTS} />
        </Panel>
        <Panel header="Available rooms" eventKey="2">
          <RoomsAvailability allConferenceRooms={allConferenceRooms} events={allEvents} />
        </Panel>
      </Accordion>
    </Col>
  </Row>
);

CurrentAndNextEvents.propTypes = {
  currentEvent: EventSchema.except('width', 'offset'),
  nextEvents: React.PropTypes.arrayOf(EventSchema.only('start')),
  nextEventStart: instanceOfMoment,
  onUpdate: React.PropTypes.func,
  onConfirm: React.PropTypes.func,
  onFinish: React.PropTypes.func,
  onCreate: React.PropTypes.func,
  onCancel: React.PropTypes.func,
  activeConferenceRoom: ConferenceRoomSchema,
  allConferenceRooms: React.PropTypes.arrayOf(ConferenceRoomSchema),
  allEvents: React.PropTypes.arrayOf(EventSchema.only('start')),
  onExtend: React.PropTypes.func
};

export default CurrentAndNextEvents;
