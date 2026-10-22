// The only file that reads a clock. Durations come from mono() (performance.now).
// wall() is read only to notice that the device slept or its clock changed (section 8.5).
// nowIso() stamps the saved date. Neither is ever used to measure a duration.
export const systemClock = {
  mono: () => performance.now(),
  wall: () => Date.now(),
  nowIso: () => new Date().toISOString()
};
