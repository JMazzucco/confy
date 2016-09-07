import ReactOnRails from 'react-on-rails';
import CalendarRoot from './components/calendar/ReactRoot';
import ConferenceRoomRoot from './components/conference_room/ReactRoot';

import './app.scss';

ReactOnRails.register({ CalendarRoot, ConferenceRoomRoot });
