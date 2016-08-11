import React, { PropTypes } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";
import bindAll from "lodash/bindAll";
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import uniqBy from 'lodash/fp/uniqBy';
import differenceBy from 'lodash/differenceBy';
import EventSource from "sources/EventSource";
import ModalHeader from "./layout/ModalHeader";
import ModalFooter from "./layout/ModalFooter";
import ModalBody from "./layout/ModalBody";

const { func, bool, array, string } = PropTypes;
const DATE_FORMAT = 'DD/MM/YYYY HH:mm';
const DATE_ERROR_TEXT = 'Start time must be lower than end time';

export default class CreateEventModal extends React.Component {
  static propTypes = {
    closeModal:      func.isRequired,
    showModal:       bool.isRequired,
    conferenceRooms: array.isRequired,
    initialDate:     string,
    refresh:         func.isRequired
  };

  static defaultProps = {
    initialDate: moment().format(DATE_FORMAT)
  };

  constructor(props) {
    super(props);

    this.state = {
      showErrorMessage: false,
      conferenceRoomId: null,
      startTime: this.props.initialDate,
      endTime: this.props.initialDate,
      availableRooms: [],
      unavailableRooms: [],
      errors: {}
    };

    bindAll(this,
      ['saveChanges', 'updateParam', 'handleCloseModal']);
  }

  componentDidUpdate(_, prevState) {
    if (prevState.startTime !== this.state.startTime || prevState.endTime !== this.state.endTime) {
      this._updateRoomAvailability();
    }
  }

  saveChanges() {
    const eventParams = {
      summary: this.state.summary || '',
      description: this.state.description || '',
      start_time: this.state.startTime,
      end_time: this.state.endTime,
      conference_room_id: this.state.conferenceRoomId
    };

    EventSource.create(eventParams)
      .then(() => {
        this.handleCloseModal();
        this.props.refresh();
      })
      .catch((e) => {
        if (e.statusText === 'Unprocessable Entity' && e.data) {
          this.setState({ errors: e.data });
        } else {
          this._showError();
        }
      });
  }

  handleCloseModal() {
    this.setState({
      errors: {},
      showErrorMessage: false
    });
    this.props.closeModal();
  }

  updateParam(key, value) {
    this.setState({ [key]: value }, () => this._validateParams(key));
  }

  render() {
    return (
      <Modal
        show={this.props.showModal}
        onHide={this.props.closeModal}
        onExited={this.handleCloseModal}>

        <ModalHeader />
        <ModalBody
          availableLocations={this.state.availableRooms}
          unavailableLocations={this.state.unavailableRooms}
          selectedLocation={this.state.conferenceRoomId}
          updateParam={this.updateParam}
          showErrorMessage={this.state.showErrorMessage}
          errors={this.state.errors} />
        <ModalFooter
          closeModal={this.props.closeModal}
          saveChanges={this.saveChanges}
          disableSaving={this.state.disableSaving} />

      </Modal>
    );
  }

  _validateTimeRange() {
    if (this.state.startTime >= this.state.endTime) {
      this.setState({
        disableSaving: true,
        errors:        { start_time: [DATE_ERROR_TEXT] }
      });
    } else {
      this.setState({
        disableSaving: false,
        errors:        { start_time: null }
      });
    }
  }

  _validateParams(key) {
    if (key === 'startTime' || key === 'endTime') {
      this._validateTimeRange(key);
    }
  }

  _showError() {
    this.setState({ showErrorMessage: true });
  }

  _updateRoomAvailability() {
    const { startTime, endTime } = this.state;
    EventSource
      .fetch({ start: startTime, end: endTime })
      .then(({ data }) => {
          const unavailableRooms = flow(
            map(e => e.conference_room),
            uniqBy(room => room.id)
          )(data);

          const availableRooms = differenceBy(this.props.conferenceRooms, unavailableRooms, room => room.id);

          this.setState({ availableRooms, unavailableRooms });
        }
      );
  }
}
