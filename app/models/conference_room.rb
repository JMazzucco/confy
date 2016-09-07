class ConferenceRoom < ApplicationRecord
  HEX_COLOR_FORMAT = /\A#[0-9a-f]{3}([0-9a-f]{3})?\z/i
  KINDS = {
    narnia: 0,
    without_walls: 1,
    mordor: 2,
    small: 3,
    big: 4
  }.freeze

  enum kind: KINDS

  delegate :channel_id, to: :channel, allow_nil: true

  before_validation { color&.downcase! }
  validates :capacity, presence: true
  validates :color, presence: true, uniqueness: {case_sensitive: false}, format: HEX_COLOR_FORMAT
  validates :title, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true

  has_one :channel, dependent: :destroy

  scope :without_channel, -> { left_outer_joins(:channel).where(channels: {id: nil}) }

  scope :with_expired_channel, -> { left_outer_joins(:channel).where(channels: {id: Channel.expired}) }

  scope :without_active_channel, -> { without_channel.or with_expired_channel }

  def self.find_or_raise(conference_room_id)
    conference_room = ConferenceRoom.find_by(id: conference_room_id)
    raise Exceptions::EventInvalidRoom, "Undefined conference room: #{conference_room_id}" unless conference_room
    conference_room
  end
end
