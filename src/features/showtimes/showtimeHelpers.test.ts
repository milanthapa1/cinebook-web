import { describe, it, expect } from 'vitest';
import {
  generateBookingDates,
  formatShowtimeClock,
  isPastSlot,
  groupShowtimesByCinema,
  findSlotByTime,
} from './showtimeHelpers';
import type { Showtime } from '../showtimes/useShowtimes';

function makeShowtime(overrides: Partial<Showtime> = {}): Showtime {
  return {
    id: 'st_test',
    movieId: 'mov_a',
    hallId: 'hall_1',
    startsAt: new Date(2026, 8, 1, 18, 30).toISOString(),
    basePrice: 450,
    premiumPrice: 650,
    hall: {
      id: 'hall_1',
      name: 'Audi 1',
      capacity: 60,
      screenType: 'IMAX Laser',
      soundSystem: 'Dolby Atmos',
      cinema: {
        id: 'cin_1',
        name: 'Civil Mall',
        locationId: 'loc_1',
        location: { id: 'loc_1', name: 'Kathmandu' },
      },
    },
    ...overrides,
  };
}

describe('generateBookingDates', () => {
  it('returns 7 consecutive days starting today in ISO format', () => {
    const dates = generateBookingDates();
    expect(dates).toHaveLength(7);
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(dates[0].iso).toBe(iso);
    expect(dates[0].day).toBe('Today');
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    expect(dates[1].dateNum).toBe(String(tomorrow.getDate()).padStart(2, '0'));
  });
});

describe('formatShowtimeClock', () => {
  it('formats 24h times as 12h with zero padding', () => {
    expect(formatShowtimeClock(new Date(2026, 8, 1, 7, 30))).toBe('07:30 AM');
    expect(formatShowtimeClock(new Date(2026, 8, 1, 12, 0))).toBe('12:00 PM');
    expect(formatShowtimeClock(new Date(2026, 8, 1, 17, 45))).toBe('05:45 PM');
  });
});

describe('isPastSlot', () => {
  it('flags dates long in the past and allows future slots', () => {
    expect(isPastSlot(new Date(Date.now() - 60 * 60 * 1000))).toBe(true);
    expect(isPastSlot(new Date(Date.now() + 60 * 60 * 1000))).toBe(false);
  });
});

describe('groupShowtimesByCinema', () => {
  it('groups by cinema, formats time, and sorts by startsAt', () => {
    const late = makeShowtime({ startsAt: new Date(2026, 8, 1, 19, 0).toISOString() });
    const early = makeShowtime({ startsAt: new Date(2026, 8, 1, 10, 30).toISOString() });
    const groups = groupShowtimesByCinema([late, early]);
    expect(groups).toHaveLength(1);
    expect(groups[0].cinemaName).toBe('Civil Mall');
    expect(groups[0].slots.map((s) => s.time)).toEqual(['10:30 AM', '07:00 PM']);
    expect(groups[0].slots[0].fmt).toBe('IMAX Laser');
  });

  it('filters by location name', () => {
    const ktm = makeShowtime();
    const pkr = makeShowtime({
      id: 'st_test_2',
      hall: { ...ktm.hall, cinema: { ...ktm.hall.cinema!, location: { id: 'loc_2', name: 'Pokhara' } } },
    });
    const groups = groupShowtimesByCinema([ktm, pkr], 'Pokhara');
    expect(groups).toHaveLength(1);
    expect(groups[0].slots[0].showtimeId).toBe('st_test_2');
  });
});

describe('findSlotByTime', () => {
  it('matches by exact showtime id first, then by time string', () => {
    const st = makeShowtime();
    const groups = groupShowtimesByCinema([st]);
    expect(findSlotByTime(groups, 'st_test')?.showtimeId).toBe('st_test');
    expect(findSlotByTime(groups, '06:30 PM')?.showtimeId).toBe('st_test');
    expect(findSlotByTime(groups, 'missing')).toBeNull();
  });
});