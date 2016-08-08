import React from 'react';
import moment from 'moment';
import { Grid, Col } from 'react-bootstrap';
import EventSource from 'sources/EventSource';
import Notification from '../models/Notification';

import Calendar from './calendar/Calendar';
import SideNav from './layout/SideNav';
import NotificationStack from './shared/alert/NotificationStack';

export default class AppContainer extends React.Component {
  static propTypes = {
    initialEvents: React.PropTypes.array,
    date: React.PropTypes.string,
    notificationTimeout: React.PropTypes.number
  };

  static defaultProps = {
    date: moment().format('YYYY-MM-DD'),
    notificationTimeout: 10000
  };

  constructor(...args) {
    super(...args);

    this.state = {
      events: this.props.initialEvents,
      updating: false,
      notifications: []
    };
    this.handleCalendarRefresh = this.handleCalendarRefresh.bind(this);
    this.handleNotificationDismiss = this.handleNotificationDismiss.bind(this);
    this._deleteEvent = this._deleteEvent.bind(this);
  }

  componentDidMount() {
    if (!this.state.events) {
      this._fetchEvents();
    }
  }

  handleCalendarRefresh() {
    this._fetchEvents();
  }

  handleNotificationDismiss(notificationId) {
    this._removeNotification(notificationId);
  }

  render() {
    const { initialEvents: _, ...calendarProps } = this.props;
    const { events, notifications, updating } = this.state;
    return (
      <div>
        <Grid>
          <Col xs={12} md={2}>
            <SideNav onRefresh={this.handleCalendarRefresh}
                     date={this.props.date}
                     updating={updating} />
          </Col>
          <Col xs={12} md={10}>
            <Calendar {...calendarProps} events={events} onDelete={this._deleteEvent} />
          </Col>
        </Grid>
        <NotificationStack notifications={notifications} onDismiss={this.handleNotificationDismiss} />
      </div>
    );
  }

  _fetchEvents() {
    this.setState({ updating: true });
    EventSource
      .fetch({ date: this.props.date })
      .then(({ data }) => {
        this.setState({ events: data, updating: false });
      })
      .catch(() =>
        this.setState({ updating: false })
      );
  }

  _deleteEvent(id) {
    EventSource.remove(id)
      .catch(() => {
        const error = new Notification('danger', 'Connection error');
        this._addNotification(error);
      });
    const events = this.state.events;
    const index = events.findIndex(event => event.id === id);
    events.splice(index, 1);
    this.setState({ events });
  }

  _addNotification(notification) {
    notification.timeout = setTimeout(
      () => this._removeNotification(notification.id),
      this.props.notificationTimeout
    );
    this.setState({ notifications: this.state.notifications.concat([notification]) });
  }

  _removeNotification(id) {
    const notifications = this.state.notifications;
    const index = notifications.findIndex(notification => notification.id === id);
    if (index > -1) {
      clearTimeout(notifications[index].timeout);
      notifications.splice(index, 1);
      this.setState({ notifications });
    }
  }
}
