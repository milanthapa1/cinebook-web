import type { Showtime } from '../showtimes/useShowtimes';

export interface BookingDateOption {
  label: string;
  shortLabel: string;
  day: string;
  dateNum: string;
  val: string;
  iso: string;
}

export function generateBookingDates(count = 7): BookingDateOption[] {
  const dates: BookingDateOption[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label =
      i === 0
        ? `Today, ${d.getDate()} ${monthNames[d.getMonth()]}`
        : `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dates.push({
      label,
      shortLabel: i === 0 ? 'Today' : monthNames[d.getMonth()],
      day: i === 0 ? 'Today' : dayNames[d.getDay()],
      dateNum: String(d.getDate()).padStart(2, '0'),
      val: label,
      iso,
    });
  }
  return dates;
}

/** Always produces a zero-padded consistent format: "07:30 AM", "12:00 PM" */
export function formatShowtimeClock(startsAt: string | Date): string {
  const d = new Date(startsAt);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/** Returns true if the showtime has already started (or is within 10 mins). */
export function isPastSlot(startsAt: string | Date): boolean {
  return new Date(startsAt).getTime() - Date.now() < 10 * 60 * 1000;
}

export interface ShowtimeSlot {
  showtimeId: string;
  time: string;
  fmt: string;
  startsAt: string;
}

export interface CinemaShowtimeGroup {
  cinemaId: string;
  cinemaName: string;
  slots: ShowtimeSlot[];
}

/** Group API showtimes by cinema; optionally filter to a location name. */
export function groupShowtimesByCinema(
  showtimes: Showtime[] | undefined,
  locationName?: string,
): CinemaShowtimeGroup[] {
  if (!showtimes?.length) return [];

  const filtered = locationName
    ? showtimes.filter((st) => {
        const loc = st.hall?.cinema?.location?.name;
        return !loc || loc === locationName;
      })
    : showtimes;

  const byCinema = new Map<string, CinemaShowtimeGroup>();

  for (const st of filtered) {
    const cinema = st.hall?.cinema;
    const cinemaId = cinema?.id ?? st.hallId;
    const cinemaName = cinema?.name ?? st.hall?.name ?? 'Cinema';
    if (!byCinema.has(cinemaId)) {
      byCinema.set(cinemaId, { cinemaId, cinemaName, slots: [] });
    }
    byCinema.get(cinemaId)!.slots.push({
      showtimeId: st.id,
      time: formatShowtimeClock(st.startsAt),
      fmt: st.hall?.screenType ?? st.hall?.name ?? 'Standard',
      startsAt: st.startsAt,
    });
  }

  for (const group of byCinema.values()) {
    group.slots.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }

  return Array.from(byCinema.values()).sort((a, b) => a.cinemaName.localeCompare(b.cinemaName));
}

/**
 * Match quick-book ?time= param to a slot.
 * Tries exact showtimeId first, then normalized time string match.
 */
export function findSlotByTime(groups: CinemaShowtimeGroup[], timeParam: string): ShowtimeSlot | null {
  // Try matching by showtimeId (most reliable when passed directly)
  for (const g of groups) {
    const byId = g.slots.find((s) => s.showtimeId === timeParam);
    if (byId) return byId;
  }
  // Fallback: normalize time string (strip leading zero, uppercase)
  const normalize = (t: string) => t.trim().toUpperCase().replace(/^0(\d:)/, '$1');
  const normalized = normalize(timeParam);
  for (const g of groups) {
    const slot = g.slots.find((s) => normalize(s.time) === normalized);
    if (slot) return slot;
  }
  return null;
}
