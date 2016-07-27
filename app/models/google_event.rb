class GoogleEvent
  InvalidParamsError = Class.new(StandardError)
  EventInTimeSpanError = Class.new(StandardError)

  EVENT_SCHEMA = Dry::Validation.Schema do
    required(:start).schema do
      required(:date_time).filled
    end

    required(:end).schema do
      required(:date_time).filled
    end
  end.freeze

  class << self
    # You can specify custom fields: https://developers.google.com/google-apps/calendar/v3/reference/events
    LISTING_FIELDS = 'items(id, start, end, summary, recurrence, creator)'.freeze

    def listing_options(fields, starting, ending)
      {fields: fields, single_events: true, time_min: starting.rfc3339(9),
       time_max: ending.rfc3339(9), time_zone: ENV.fetch('TZ')}
    end

    def list_events(credentials, user_email, starting, ending)
      all_events = daily_events_container
      rooms = ConferenceRoom.all
      calendar_service(credentials).batch do |service|
        rooms.each do |room|
          config = listing_options(LISTING_FIELDS, starting, ending)
          service.list_events(room.email, config) do |new_events, _|
            merge_events(new_events, room, all_events)
          end
        end
      end
      mark_user_events(user_email, all_events)
      all_events
    end

    def daily_events_container
      Hash[(1..7).map { |i| [i, []] }]
    end

    def merge_events(new_events, room, all_events)
      return unless new_events
      new_events.items.each do |event|
        normalize_event_datetime(event)
        all_events[event.start.date_time.wday] << event.to_h.merge(conference_room: room)
      end
    end

    def normalize_event_datetime(event)
      event.start.date_time = EventGrouper.floor_time event.start.date_time
      event.end.date_time = EventGrouper.ceil_time event.end.date_time
    end

    def mark_user_events(user_email, all_events)
      all_events.values.each do |events|
        events.each do |event|
          creator_email = event[:creator][:email]
          event[:creator][:self] = (user_email == creator_email)
        end
      end
    end

    def process_params(params)
      zone = Time.now.getlocal.zone
      params.merge(start: {date_time: DateTime.parse("#{params[:start_time]} #{zone}").rfc3339(9)},
                   end: {date_time: DateTime.parse("#{params[:end_time]} #{zone}").rfc3339(9)}).
        except(:start_time, :end_time, :conference_room_id, :permitted)
    end

    def delete(credentials, event_id)
      calendar_service(credentials).delete_event('primary', event_id)
    end

    def create(credentials, conference_room_id, raw_event_data = {})
      event_data = build_event_data(raw_event_data, conference_room_id)
      insert_event_and_return_result(credentials, event_data)
    end

    def insert_event_and_return_result(credentials, event_data)
      events = events_in_span(credentials, event_data[:attendees].first,
                              event_data[:start][:date_time], event_data[:end][:date_time])
      if events && events.items.any?
        count = events.items.size
        raise(
          EventInTimeSpanError,
          "Already #{count} #{'event'.pluralize(count)} in time span(#{items_list(events.items)})."
        )
      end
      calendar_service(credentials).insert_event(
        'primary',
        Google::Apis::CalendarV3::Event.new(event_data)
      )
    end

    def items_list(items)
      items.map(&:summary).join(', '.freeze)
    end

    def build_event_data(raw_event_data, conference_room_id)
      event_data = raw_event_data.deep_symbolize_keys
      raise_exception_if_invalid(event_data)
      add_room_to_event(event_data, conference_room_id)
      event_data
    end

    def raise_exception_if_invalid(params)
      validation = EVENT_SCHEMA.call params
      exception_message = validation.messages(full: true).values.join(', ')
      raise InvalidParamsError, exception_message unless validation.success?
    end

    def add_room_to_event(params, conference_room_id)
      room = ConferenceRoom.find_by(id: conference_room_id)
      params[:attendees] = [{email: room.email}]
      params[:location] = room.title
    end

    def events_in_span(credentials, conference_room, starting, ending)
      calendar_service(credentials).list_events(
        conference_room[:email],
        time_min: starting,
        time_max: ending
      )
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

  private_class_method :calendar_service,
                       :client, :raise_exception_if_invalid,
                       :insert_event_and_return_result, :build_event_data,
                       :daily_events_container, :merge_events, :normalize_event_datetime,
                       :items_list
end
