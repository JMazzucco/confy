import React from 'react';
import { Checkbox } from 'react-bootstrap'
import { mount, shallow } from 'enzyme';
import RoomFilters from '../app/components/calendar/RoomFilters'
import chai from 'chai'

var expect = chai.expect;

describe('<RoomFilters />', () => {

    it('renders Checkbox component', () => {
        let conferenceRooms = [{id: 12, title: "ala", color:"#000000"}];
        const wrapper = shallow(<RoomFilters add={a => a+2} delete={b => b-2} conferenceRooms={conferenceRooms}/>);
        expect(wrapper.find(Checkbox)).to.have.length(1);
        expect(wrapper.is('div')).to.eq(true);
    });

});