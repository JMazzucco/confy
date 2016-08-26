import React, { PropTypes } from 'react';
import { If, Else } from 'react-if';
import bindAll from 'lodash/bindAll';
import DeleteButton from 'components/calendar/event/DeleteButton';
import DeleteTooltip from 'components/calendar/event/DeleteTooltip';
import DeleteConfirmation from 'components/calendar/event/DeleteConfirmation';
import EventSchema from 'schemas/EventSchema';
import './event.scss';

export default class EventDestroyer extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    event:    EventSchema.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      showIndicator: false,
      showConfirmationModal: false
    };

    bindAll(this, ['_handleOnClick', '_handleConfirmDeletion', '_hideConfirmationModal']);
  }

  render() {
    return (
      <div>
        <DeleteButton onClick={this._handleOnClick} disabled={this.props.disabled} ref="target" />
        <If condition={this.props.disabled}>
          <DeleteTooltip show={this.state.showIndicator} target={() => this.refs.target} />
          <Else>
            <DeleteConfirmation show={this.state.showConfirmationModal}
                                onCancel={this._hideConfirmationModal}
                                onConfirm={this._handleConfirmDeletion}
                                onHide={this._hideConfirmationModal}
                                event={this.props.event} />
          </Else>
        </If>
      </div>
    );
  }

  _hideConfirmationModal() {
    this.setState({ showConfirmationModal: false });
  }

  _handleConfirmDeletion() {
    this._hideConfirmationModal();
    return this.props.onDelete();
  }

  _handleOnClickEnabled() {
    this.setState({ showConfirmationModal: true });
  }

  _handleOnClickDisabled() {
    this.setState({ showIndicator: true });

    setTimeout(() => this.setState({ showIndicator: false }), 2000);

    return false;
  }

  _handleOnClick() {
    if (!this.props.disabled) {
      return this._handleOnClickEnabled();
    }
    return this._handleOnClickDisabled();
  }
}
