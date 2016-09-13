module GoogleCalendar
  module EventWrapper
    class Builder
      ACCEPTED_STATUS = 'accepted'.freeze

      # rubocop:disable Metrics/AbcSize
      def initialize(params)
        data = params.deep_symbolize_keys
        @summary = data[:summary]
        @description = data[:description]
        @user_email = data[:user_email]
        @start_time = build_date_time(data[:start_time])
        @end_time = build_date_time(data[:end_time])
        @conference_room = build_conference_room(data[:conference_room_id])
        @attendees = build_attendees(data[:attendees])
        @location = build_location
      end
      # rubocop:enable Metrics/AbcSize

      def build_event_wrapper
        GoogleCalendar::EventWrapper::Event.new(google_event, additional_params)
      end

      def build_rounded_event_wrapper
        GoogleCalendar::EventWrapper::RoundedEvent.new(google_event, additional_params)
      end

      private

      attr_accessor :summary, :description, :location, :start_time,
                    :end_time, :attendees, :conference_room, :user_email, :creator

      def build_date_time(date_time)
        Google::Apis::CalendarV3::EventDateTime.new(date_time: format_date_time(date_time)) if date_time
      end

      def format_date_time(time)
        DateTime.parse("#{time} #{time_zone}")
      end

      def time_zone
        @time_zone ||= Time.now.getlocal.zone
      end

      def build_attendees(attendees)
        result = attendees.nil? ? [] : attendees.map { |attendee| new_attendee(attendee) }
        result + [room_attendee, creator_attendee].compact
      end

      def room_attendee
        return unless conference_room
        new_attendee email: conference_room.email, response_status: ACCEPTED_STATUS
      end

      def creator_attendee
        return unless user_email
        new_attendee email: user_email, response_status: ACCEPTED_STATUS
      end

      def new_attendee(attendee_data)
        Google::Apis::CalendarV3::EventAttendee.new(attendee_data)
      end

      def build_conference_room(conference_room_id)
        return if conference_room_id.nil?
        ConferenceRoom.find(conference_room_id)
      end

      def build_location
        conference_room.try(:title) || ''
      end

      def google_event
        Google::Apis::CalendarV3::Event.new.tap do |event|
          event.summary = summary
          event.description = description
          event.location = location
          event.start = start_time
          event.end = end_time
          event.attendees = attendees
        end
      end

      def additional_params
        {
          user_email: user_email,
          conference_room: conference_room
        }
      end
    end
  end
end
