// Exam Lockout Timing & Auto-Buffer Service
// Enforces institutional integrity policy:
// 1. Locks portal 30 minutes BEFORE scheduled exam start time
// 2. Keeps portal locked during entire exam duration
// 3. Automatically unlocks portal 30 minutes AFTER scheduled exam end time

const STORAGE_KEY = 'aisa_exam_locks';

// Helper to format Date to YYYY-MM-DD in local time
export function getTodayDateString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format Date to HH:mm in local time
export function getTimeString(d = new Date()) {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Convert 24-hr time (HH:mm) to 12-hr readable string (e.g. 10:00 AM)
export function formatTime12Hr(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

// Parse date & time string into Date object
export function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // Handle formats like "10:00 AM" if legacy
  let cleanTime = timeStr;
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const isPM = timeStr.includes('PM');
    const parts = timeStr.replace(/AM|PM/g, '').trim().split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    cleanTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = cleanTime.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0);
}

// Initial Default Locks (Includes 1 scheduled exam configured around current time for easy testing)
function getDefaultLocks() {
  const now = new Date();
  
  // Create a sample exam today that is currently active (e.g. started 20 mins ago, runs for 1.5 hrs)
  const activeStart = new Date(now.getTime() - 20 * 60 * 1000);
  const activeEnd = new Date(now.getTime() + 70 * 60 * 1000);

  // Create an upcoming exam today (starts in 2 hours)
  const upcomingStart = new Date(now.getTime() + 120 * 60 * 1000);
  const upcomingEnd = new Date(now.getTime() + 240 * 60 * 1000);

  return [
    {
      id: 'lock-active-sample',
      course: 'DBMS - SQL (CS204)',
      semester: 'Semester 2',
      date: getTodayDateString(0),
      startTime: getTimeString(activeStart),
      endTime: getTimeString(activeEnd),
      status: 'Active',
      manualOverride: null, // 'locked' | 'unlocked' | null
      lockedQueries: 48,
      department: 'Computer Science & Engineering'
    },
    {
      id: 'lock-upcoming-sample',
      course: 'Data Structures & Algorithms - II (CS301)',
      semester: 'Semester 3',
      date: getTodayDateString(0),
      startTime: getTimeString(upcomingStart),
      endTime: getTimeString(upcomingEnd),
      status: 'Scheduled',
      manualOverride: null,
      lockedQueries: 0,
      department: 'Computer Science & Engineering'
    },
    {
      id: 'lock-tomorrow-sample',
      course: 'Operating Systems & Concurrency (CS302)',
      semester: 'Semester 3',
      date: getTodayDateString(1),
      startTime: '10:00',
      endTime: '13:00',
      status: 'Scheduled',
      manualOverride: null,
      lockedQueries: 0,
      department: 'Computer Science & Engineering'
    }
  ];
}

// Fetch locks from localStorage
export function getSavedExamLocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading exam locks from localStorage', e);
  }
  const defaults = getDefaultLocks();
  saveExamLocks(defaults);
  return defaults;
}

// Save locks to localStorage and dispatch custom storage event for instant tab sync
export function saveExamLocks(locks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
    window.dispatchEvent(new Event('aisa_locks_updated'));
  } catch (e) {
    console.error('Error saving exam locks', e);
  }
}

// Calculate exact status and timing metrics for a given lock
export function evaluateLockTiming(lock, currentTime = new Date()) {
  const startDt = parseDateTime(lock.date, lock.startTime);
  const endDt = parseDateTime(lock.date, lock.endTime);

  if (!startDt || !endDt) {
    return {
      status: lock.status || 'Inactive',
      isLocked: lock.status === 'Active',
      reason: 'Invalid timing',
      timeRemainingStr: '',
      bufferNotice: ''
    };
  }

  // 30 mins before start
  const lockEffectiveStart = new Date(startDt.getTime() - 30 * 60 * 1000);
  // 30 mins after end
  const lockEffectiveEnd = new Date(endDt.getTime() + 30 * 60 * 1000);

  const nowMs = currentTime.getTime();
  const lockStartMs = lockEffectiveStart.getTime();
  const lockEndMs = lockEffectiveEnd.getTime();
  const examStartMs = startDt.getTime();
  const examEndMs = endDt.getTime();

  // Check manual override first
  if (lock.manualOverride === 'locked') {
    return {
      status: 'Active',
      isLocked: true,
      reason: 'Manual Faculty Override: Lock Force-Activated',
      lockEffectiveStart,
      lockEffectiveEnd,
      timeRemainingMs: Math.max(0, lockEndMs - nowMs),
      timeRemainingStr: formatDuration(Math.max(0, lockEndMs - nowMs)),
      isInBuffer: true
    };
  }
  if (lock.manualOverride === 'unlocked') {
    return {
      status: 'Inactive',
      isLocked: false,
      reason: 'Manual Faculty Override: Lock Deactivated',
      lockEffectiveStart,
      lockEffectiveEnd,
      timeRemainingMs: 0,
      timeRemainingStr: '',
      isInBuffer: false
    };
  }

  // Auto-calculated state based on current time
  if (nowMs >= lockStartMs && nowMs <= lockEndMs) {
    // LOCK IS ACTIVE!
    let stage = '';
    if (nowMs < examStartMs) {
      stage = '30-min Pre-Exam Integrity Buffer';
    } else if (nowMs <= examEndMs) {
      stage = 'Examination In Progress';
    } else {
      stage = '30-min Post-Exam Integrity Buffer';
    }

    const remainingMs = lockEndMs - nowMs;
    return {
      status: 'Active',
      isLocked: true,
      reason: stage,
      lockEffectiveStart,
      lockEffectiveEnd,
      timeRemainingMs: remainingMs,
      timeRemainingStr: formatDuration(remainingMs),
      isInBuffer: nowMs < examStartMs || nowMs > examEndMs,
      examStart: startDt,
      examEnd: endDt
    };
  } else if (nowMs < lockStartMs) {
    // Scheduled for future
    const msUntilLock = lockStartMs - nowMs;
    return {
      status: 'Scheduled',
      isLocked: false,
      reason: `Locks in ${formatDuration(msUntilLock)} (30m before exam)`,
      lockEffectiveStart,
      lockEffectiveEnd,
      timeRemainingMs: msUntilLock,
      timeRemainingStr: formatDuration(msUntilLock),
      isInBuffer: false,
      examStart: startDt,
      examEnd: endDt
    };
  } else {
    // Completed / Passed
    return {
      status: 'Completed',
      isLocked: false,
      reason: 'Exam Window & 30m Buffer Concluded',
      lockEffectiveStart,
      lockEffectiveEnd,
      timeRemainingMs: 0,
      timeRemainingStr: '',
      isInBuffer: false,
      examStart: startDt,
      examEnd: endDt
    };
  }
}

// Determine if any lock is currently active for the entire portal or specific subject
export function getActiveExamLockSummary(locks = [], currentTime = new Date()) {
  for (const lock of locks) {
    const timing = evaluateLockTiming(lock, currentTime);
    if (timing.isLocked) {
      return {
        hasActiveLock: true,
        activeLock: lock,
        timing
      };
    }
  }

  // Check if there are any upcoming locks in next 30 mins
  let nextUpcoming = null;
  for (const lock of locks) {
    const timing = evaluateLockTiming(lock, currentTime);
    if (timing.status === 'Scheduled') {
      if (!nextUpcoming || timing.timeRemainingMs < nextUpcoming.timing.timeRemainingMs) {
        nextUpcoming = { lock, timing };
      }
    }
  }

  return {
    hasActiveLock: false,
    activeLock: null,
    nextUpcoming: nextUpcoming?.lock || null,
    nextTiming: nextUpcoming?.timing || null
  };
}

// Format milliseconds into "HH:MM:SS" or readable string
export function formatDuration(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}
