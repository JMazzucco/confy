import React from 'react';
import { Checkbox } from 'react-bootstrap';
import { mount, shallow } from 'enzyme';
import Filter from '../../app/components/calendar/filters/Filter';
import { expect } from 'chai';
import sinon from 'sinon';
import ConferenceRoom from '../factories/ConferenceRoom';


describe('<Filter />', () => {
  const conferenceRoom = ConferenceRoom.build();
  const defaultProps = {
    conferenceRoom,
    onEnabled: () => {},
    onDisabled: () => {},
    enabled: false
  };
  const defaultWrapper = shallow(<Filter {...defaultProps} />);

  it('renders <Checbkox />', () => {
    expect(defaultWrapper.find(Checkbox)).to.have.lengthOf(1);
  });

  it('sets .filter-box backgroundColor', () => {
    expect(defaultWrapper.find('.filter-box').props().style.backgroundColor).to.eq(conferenceRoom.color);
  });

  it('puts conference room title inside Checkbox component', () => {
    expect(defaultWrapper.find(Checkbox).children().text()).to.eq(conferenceRoom.title);
  });

  it("triggers appropriate handler based on 'enabled' prop", () => {
    const onEnabled = sinon.spy();
    const onDisabled = sinon.spy();
    const props = {
      conferenceRoom,
      onEnabled,
      onDisabled,
      enabled: false
    };
    const wrapper = mount(<Filter {...props} />);

    wrapper.find('input').simulate('change');
    expect(onDisabled).to.have.been.calledOnce;
    expect(onDisabled.calledWith(conferenceRoom.id)).to.eq(true);

    wrapper.setProps({ enabled: true });

    wrapper.find('input').simulate('change');
    expect(onEnabled).to.have.been.calledOnce;
    expect(onEnabled.calledWith(conferenceRoom.id)).to.eq(true);
  });
});
