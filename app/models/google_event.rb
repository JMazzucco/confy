class GoogleEvent
  class InvalidParamsException < StandardError; end

  EVENT_SCHEMA = Dry::Validation.Schema do
    required(:start).schema do
      required(:date_time).filled
    end

    required(:end).schema do
      required(:date_time).filled
    end
  end.freeze

  class << self
    #You can specify custom fields: https://developers.google.com/google-apps/calendar/v3/reference/events
    FIELDS = "items(start, end, summary, recurrence, creator(displayName))".freeze

    def list_events(credentials, starting, ending)
      events = {}
      rooms = ConferenceRoom.all
      calendar_service(credentials).batch do |service|
        rooms.each do |room|
          config = { fields: FIELDS, single_events: true, time_min: starting.rfc3339(9),
                     time_max: ending.rfc3339(9), time_zone: 'Europe/Warsaw' }
          service.list_events(room.email, config) do |result, _|
            next unless result
            result.items&.each do |event|
              events[event.start.date_time.wday] ||= []
              events[event.start.date_time.wday] << Event.new(
                  user: event.creator.display_name,
                  end_time: event.end.date_time,
                  start_time: event.start.date_time,
                  conference_room: room,
                  description: event.description,
                  name: event.summary
              )
            end
          end
        end
      end
      events
    end

    def format_params(params)
      params.merge(
          start: {date_time: DateTime.parse(params[:start_time]).rfc3339(9)},
          end: {date_time: DateTime.parse(params[:end_time]).rfc3339(9)}
      ).except(:start_time, :end_time, :conference_room_id, :permitted)
    end

    def create(credentials, conference_room_ids, event_data = {})
      event_data = event_data.deep_symbolize_keys
      raise_exception_if_invalid(event_data)
      add_rooms_to_event(event_data, conference_room_ids)
      insert_event_and_return_result(credentials, event_data)
    end

    def insert_event_and_return_result(credentials, event_data)
      new_event = Google::Apis::CalendarV3::Event.new(event_data)
      calendar_service(credentials).insert_event('primary', new_event)
    end

    def raise_exception_if_invalid(params)
      validation = EVENT_SCHEMA.call params
      unless validation.success?
        error_msg = validation.messages(full: true).values.join(', ')
        raise InvalidParamsException, error_msg
      end
    end

    def add_rooms_to_event(params, conference_room_ids)
      params[:attendees] = ConferenceRoom.where(id: conference_room_ids).pluck(:email).map do |email|
        {email: email}
      end
    end

    def calendar_service(credentials)
      Google::Apis::CalendarV3::CalendarService.new.tap { |s| s.authorization = client(credentials) }
    end

    def client(credentials)
      Signet::OAuth2::Client.new(JSON.parse(credentials))
    end

    def load_emails
      ConferenceRoom.pluck(:email)
    end

  end

  private_class_method :calendar_service, :client, :load_emails
end