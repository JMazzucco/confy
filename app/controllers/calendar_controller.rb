class CalendarController < ApplicationController

  def index
    week_start = params[:start] ? Date.parse(params[:start]) : Date.today.beginning_of_week
    week_end = params[:end] ? Date.parse(params[:end]) : week_start + 4
    @days = (week_start..week_end).to_a

    start_time = Time.now.at_beginning_of_day
    end_time = Time.now.at_end_of_day
    step = 30.minutes
    @times = time_interval(start_time, end_time, step)

    @events = Event.all.group_by { |e| e.start_time.wday }
  end

  private
  def time_interval(start_time, end_time, step)
    (start_time.to_i..end_time.to_i).step(step).collect { |time| Time.at time }
  end

end
