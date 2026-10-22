// Coming back, the kid-safe way (logic spec section 19). Every reward is earned by reading, never by
// just opening Beacon, and nothing is ever lost by missing a day:
// - a reading day is a local calendar day with at least one finished check-in or quest; the total only goes up;
// - the weekly goal counts this week's reading days and starts over each Monday, with no word about last week;
// - each reading day adds one keepsake to the shelf;
// - every finished text is a step on Lumi's path, and some steps add an item to her cliff (scenes.js).
// No streak, no points, no ranks, no timer, no energy and no deadline.

export const WEEK_GOAL = 3;

// After this many finished texts, this item appears on Lumi's cliff.
export const PATH = [
  { at: 1, id: 'flowers' }, { at: 2, id: 'gull' }, { at: 3, id: 'kite' }, { at: 5, id: 'sailboat' },
  { at: 7, id: 'bunting' }, { at: 10, id: 'telescope' }, { at: 13, id: 'cottage' }, { at: 16, id: 'whale' },
  { at: 20, id: 'balloon' }, { at: 25, id: 'moon' }
];

// One keepsake for each reading day, in this order, then round again.
export const KEEPSAKES = ['shell', 'starfish', 'sea-glass', 'feather', 'pebble', 'acorn', 'leaf', 'sand-dollar'];

const pad = n => String(n).padStart(2, '0');
const dayOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// The device's local calendar day of a saved time, as YYYY-MM-DD.
export function localDay(iso) {
  return dayOf(new Date(iso));
}

// The Monday that starts the week of a local day.
export function weekOf(day) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dayOf(date);
}

// Every saved check-in and quest record is a finished one.
const finished = learner => learner.quests || [];

export function weekGoal(learner, nowIso) {
  const week = weekOf(localDay(nowIso));
  const days = new Set(finished(learner).map(q => localDay(q.at)).filter(d => weekOf(d) === week)).size;
  return { days, goal: WEEK_GOAL, met: days >= WEEK_GOAL };
}

// Counts a new reading day when a check-in or quest is finished.
export function countReadingDay(learner, atIso) {
  const day = localDay(atIso);
  if (learner.lastReadingDay === day) return { learner, newDay: false };
  return { learner: { ...learner, readingDays: (learner.readingDays || 0) + 1, lastReadingDay: day }, newDay: true };
}

export const keepsakeFor = n => KEEPSAKES[(n - 1) % KEEPSAKES.length];

// The shelf: how many of each keepsake, in the order they were first found.
export function shelf(learner) {
  const counts = new Map();
  for (let n = 1; n <= (learner.readingDays || 0); n++) counts.set(keepsakeFor(n), (counts.get(keepsakeFor(n)) || 0) + 1);
  return [...counts].map(([id, count]) => ({ id, count }));
}

// Today's keepsake, once today's first text is finished; null before that.
export function todaysKeepsake(learner, nowIso) {
  return learner.readingDays && learner.lastReadingDay === localDay(nowIso) ? keepsakeFor(learner.readingDays) : null;
}

export function path(learner) {
  const done = finished(learner).length;
  const next = PATH.find(p => done < p.at);
  return { done, unlocked: PATH.filter(p => done >= p.at).map(p => p.id), next: next ? { id: next.id, left: next.at - done } : null };
}

export function newlyUnlocked(before, after) {
  const had = new Set(path(before).unlocked);
  return path(after).unlocked.filter(id => !had.has(id));
}

// For migration: the reading days already in the saved quests.
export function readingDaysFrom(quests) {
  const days = [...new Set((quests || []).map(q => localDay(q.at)))].sort();
  return { readingDays: days.length, lastReadingDay: days.length ? days[days.length - 1] : null };
}
