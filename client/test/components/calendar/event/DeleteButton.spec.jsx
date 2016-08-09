import React from "react";
import {shallow, mount} from "enzyme";
import DeleteButton from "../../../../app/components/calendar/event/DeleteButton";
import {expect} from "chai";
import sinon from "sinon";

describe('<DeleteButton />', () => {
  const id = '123';
  it('renders', () => {
    const wrapper = mount(<DeleteButton id={id} onDelete={(_id) => {}} disabled={false} />);
    expect(wrapper.find('span').props().className).to.contain('delete-button');
    expect(wrapper.find('span').props().className).to.contain('glyphicon');
  });

  describe('click', () => {
    const spy = sinon.spy();
    const wrapper = mount(<DeleteButton id={id} onDelete={spy} />);
    wrapper.simulate('click');
    expect(spy.calledWith(id)).to.eq(true);
  });
});
