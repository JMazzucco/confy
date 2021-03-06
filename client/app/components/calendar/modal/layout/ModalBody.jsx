import React from 'react';
import { Modal, Col } from 'react-bootstrap';
import bindAll from 'lodash/bindAll';
import FormTextField from './body/FormTextField';
import FormDateField from './body/FormDateField';
import FormLocationField from './body/FormLocationField';
import ErrorField from './ErrorField';
import GuestsField from './body/GuestsField';
import RecurrenceComponent from './body/RecurrenceComponent';
import instanceOfMoment from 'proptypes/moment';

const { func, array, object, bool, number } = React.PropTypes;

export default class ModalBody extends React.Component {
  static propTypes = {
    updateParam: func.isRequired,
    availableLocations: array,
    unavailableLocations: array,
    selectedLocation: number,
    errors: object,
    showErrorMessage: bool,
    onGuestsError: func.isRequired,
    onDateError: func,
    startTime: instanceOfMoment,
    endTime: instanceOfMoment
  };

  static defaultProps = {
    showErrorMessage: false,
    errors: {}
  };

  constructor(props) {
    super(props);

    bindAll(this,
      ['handleTextFieldChange', 'handleLocationChange', 'handleTimeChange',
        'handleGuestsChange', 'handleRecurrenceChange']);
  }

  handleTextFieldChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.props.updateParam(name, value);
  }


  handleLocationChange(e) {
    this.props.updateParam('conferenceRoomId', parseInt(e.target.value, 10));
  }

  handleTimeChange(e) {
    this.props.updateParam('startTime', e.startTime);
    this.props.updateParam('endTime', e.endTime);
  }

  handleGuestsChange(e) {
    this.props.updateParam('attendees', e);
  }

  handleRecurrenceChange(option) {
    this.props.updateParam('recurrence', option);
  }

  render() {
    return (
      <Modal.Body>
        <ErrorField show={this.props.showErrorMessage} />
        <form>
          <FormTextField
            name={"summary"}
            onChange={this.handleTextFieldChange} />
          <FormDateField
            label={"When"}
            onChange={this.handleTimeChange}
            onError={this.props.onDateError}
            error={this.props.errors.start_time || this.props.errors.end_time}
            startTime={this.props.startTime}
            endTime={this.props.endTime}
            required />
          <RecurrenceComponent onChange={this.handleRecurrenceChange} />
          <FormLocationField
            available={this.props.availableLocations}
            unavailable={this.props.unavailableLocations}
            selected={this.props.selectedLocation}
            onChange={this.handleLocationChange}
            validationState={!!this.props.errors.conference_room_id}
            error={this.props.errors.conference_room_id}
            required />
          <GuestsField
            onChange={this.handleGuestsChange}
            onError={this.props.onGuestsError} />
          <FormTextField
            name={"description"}
            onChange={this.handleTextFieldChange} />
        </form>
      </Modal.Body>
    );
  }
}
