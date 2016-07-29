import React from 'react';
import { If, Then } from 'react-if';

import EventGroup from './EventGroup';

class EventWrapper extends React.Component {
  static propTypes = {
    events: React.PropTypes.array
  };

  constructor(...args) {
    super(...args);
    this.state = { height: 0, width: 0 };

    this.handleContainerMounted = this.handleContainerMounted.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  handleContainerMounted(container) {
    this.container = container;
    this.handleResize();
  }

  handleResize() {
    if (this.container) {
      const { width, height } = this.container.getBoundingClientRect();
      this.setState({ width, height });
    }
  }

  render() {
    return (
      <td ref={this.handleContainerMounted}>
        <If condition={this.props.events != null}>
          <Then>{() =>
            <EventGroup {...this.props}
                        containerWidth={this.state.width}
                        containerHeight={this.state.height} />}
          </Then>
        </If>
      </td>
    );
  }
}

export default EventWrapper;