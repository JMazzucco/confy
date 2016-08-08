import * as EventHelper from '../../app/helpers/EventHelper';
import { expect } from 'chai';
import Event from '../factories/Event';
import EventGroup from '../factories/EventGroup';
import moment from 'moment';

describe('EventGroup', () => {
  it('has a working factory', () => {
    const event1 = Event.build({}, { start_time: new Date(2016, 7, 25, 16, 0, 0) });
    const event2 = Event.build({}, { start_time: new Date(2016, 7, 25, 4, 0, 0) });

    const group = EventGroup.build({ events: [event1, event2] });

    expect(group.start).to.equal(event2.start_timestamp);
    expect(group.end).to.equal(event1.start_timestamp);
  });
});

describe('EventHelper', () => {
  describe('#eventGroupContaining()', () => {
    const event1 = Event.build({}, { start_time: new Date(2016, 7, 25, 4, 0, 0) });
    const event2 = Event.build({}, { start_time: new Date(2016, 7, 25, 16, 0, 0) });
    const event3 = Event.build({}, { start_time: new Date(2016, 7, 26, 4, 0, 0) });
    const event4 = Event.build({}, { start_time: new Date(2016, 7, 26, 12, 0, 0) });
    const timestamp = (new Date(2016, 7, 25, 4, 0, 0, 0)).getTime() / 1000;

    const group1 = EventGroup.build({ events: [event1, event2] });
    const group2 = EventGroup.build({ events: [event3, event4] });
    const events = [group1, group2];

    it('returns events group that belongs to specific day and at least one event start at the specific time', () => {
      expect(EventHelper.eventGroupContaining(events, timestamp)).to.eql(group1);
    });
  });

  describe('#eventsStartingAt()', () => {
    const event1 = Event.build({}, { start_time: new Date(2016, 7, 25, 0, 0, 0) });
    const event2 = Event.build({}, { start_time: new Date(2016, 7, 25, 0, 0, 0) });
    const event3 = Event.build({}, { start_time: new Date(2016, 7, 25, 1, 0, 0) });
    const timestamp = (new Date(2016, 7, 25, 0, 0, 0)).getTime() / 1000;

    const group = EventGroup.build({ events: [event1, event2, event3] });

    it('returns events that starts at the specific time', () => {
      expect(EventHelper.eventsStartingAt(timestamp, group)).to.eql([event1, event2]);
    });
  });

  describe('#buildBlocks()', () => {
    const startTime = moment('2016-01-01T06:00:00');
    const event1 = Event.build({}, {
      start_time: startTime.toDate(),
      end_time:   startTime.clone().add(1, 'hours').toDate()
    });

    it('sets proper block start and end', () => {
      const event2 = Event.build({}, {
        start_time: startTime.clone().add(30, 'minutes').toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const group = EventHelper.buildBlocks([event1, event2])[0];

      expect(group.start).to.equal(event1.start_timestamp);
      expect(group.end).to.equal(event2.start_timestamp);
    });

    describe('with mutually colliding events', () => {
      const event2 = Event.build({}, {
        start_time: startTime.clone().add(30, 'minutes').toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const event3 = Event.build({}, {
        start_time: startTime.clone().add(1, 'hours').toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const event4 = Event.build({}, {
        start_time: startTime.clone().add(2, 'hours').toDate(),
        end_time:   startTime.clone().add(3, 'hours').toDate()
      });
      const event5 = Event.build({}, {
        start_time: startTime.clone().add(3, 'hours').toDate(),
        end_time:   startTime.clone().add(5, 'hours').toDate()
      });
      const events = [event1, event2, event3, event4, event5];

      const group1 = EventGroup.build({ events: [event1, event2, event3] });
      const group2 = EventGroup.build({ events: [event4] });
      const group3 = EventGroup.build({ events: [event5] });
      const expectedGroups = [group1, group2, group3];

      it('groups overlapping events', () => {
        expect(EventHelper.buildBlocks(events)).to.eql(expectedGroups);
      });
    });

    describe('with pairwise colliding events', () => {
      const event2 = Event.build({}, {
        start_time: startTime.clone().subtract(1, 'hours').toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const event3 = Event.build({}, {
        start_time: startTime.clone().add(1, 'hours').toDate(),
        end_time:   startTime.clone().add(3, 'hours').toDate()
      });
      const events = [event1, event2, event3];

      const expectedGroups = [EventGroup.build({ events: [event2, event1, event3] })];

      it('groups overlapping events into one block', () => {
        expect(EventHelper.buildBlocks(events)).to.eql(expectedGroups);
      });
    });

    describe('colliding events separated by another block', () => {
      const event2 = Event.build({}, {
        start_time: startTime.clone().add(2, 'hours').toDate(),
        end_time:   startTime.clone().add(3, 'hours').toDate()
      });
      const event3 = Event.build({}, {
        start_time: startTime.clone().toDate(),
        end_time:   startTime.clone().add(4, 'hours').toDate()
      });
      const events = [event1, event3, event2];

      const expectedGroup = EventGroup.build({ events: [event1, event3, event2] });

      it('groups overlapping events into one block', () => {
        expect(EventHelper.buildBlocks(events)[0]).to.eql(expectedGroup);
      });
    });
  });

  describe('#setEventsPositionAttributes', () => {
    const startTime = moment('2016-01-01T06:00:00');
    describe('given non colliding events', () => {
      const event1 = Event.build({}, {
        start_time: startTime.toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const event2 = Event.build({}, {
        start_time: startTime.clone().add(2, 'hours').toDate(),
        end_time:   startTime.clone().add(3, 'hours').toDate()
      });
      const event3 = Event.build({}, {
        start_time: startTime.clone().add(4, 'hours').toDate(),
        end_time:   startTime.clone().add(5, 'hours').toDate()
      });

      const group = EventGroup.build({ events: [event1, event2, event3] });
      const groups = [group];

      it('sets 100% width for all events and 0 offset', () => {
        EventHelper.setEventsPositionAttributes(groups);
        group.events.forEach(event => {
          expect(event.width).to.eq(1);
          expect(event.offset).to.eq(0);
        });
      });
    });

    describe('given pairwise colliding events', () => {
      const event1 = Event.build({}, {
        start_time: startTime.toDate(),
        end_time:   startTime.clone().add(2, 'hours').toDate()
      });
      const event2 = Event.build({}, {
        start_time: startTime.clone().add(1, 'hours').toDate(),
        end_time:   startTime.clone().add(3, 'hours').toDate()
      });
      const event3 = Event.build({}, {
        start_time: startTime.clone().add(2, 'hours').toDate(),
        end_time:   startTime.clone().add(5, 'hours').toDate()
      });

      const group = EventGroup.build({ events: [event1, event2, event3] });
      const groups = [group];

      it('sets 50% width for all events and event1.offset = event3.offset = 0 and event2.offset = 1', () => {
        EventHelper.setEventsPositionAttributes(groups);
        group.events.forEach(event => expect(event.width).to.eq(0.5));
        expect(event1.offset).to.eq(0);
        expect(event2.offset).to.eq(1);
        expect(event3.offset).to.eq(0);
      });
    });
  });
});
