/**
 * Attendance Security and Calculation Utilities
 */

/**
 * Extract normalized client IP address from request
 * @param {Object} req
 * @returns {String}
 */
export function extractClientIp(req) {
    let ip = null;

    if (req.headers && req.headers['x-forwarded-for']) {
        ip = String(req.headers['x-forwarded-for']).split(',')[0].trim();
    }

    if (!ip) {
        ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    }

    if (ip) {
        // Strip IPv6-mapped IPv4 prefix
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        if (ip === '::1') {
            ip = '127.0.0.1';
        }
    }

    return ip || '127.0.0.1';
}

/**
 * Extract user agent from request
 * @param {Object} req
 * @returns {String}
 */
export function extractUserAgent(req) {
    return (req.headers && req.headers['user-agent']) || 'Unknown';
}

/**
 * Validate latitude and longitude coordinates
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @returns {boolean}
 */
export function isValidCoordinates(latitude, longitude) {
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return false;
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return false;
    }

    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Calculate Great-Circle distance between two coordinates in meters (Haversine formula)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in meters
 */
export function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (parseFloat(lat1) * Math.PI) / 180;
    const phi2 = (parseFloat(lat2) * Math.PI) / 180;
    const deltaPhi = ((parseFloat(lat2) - parseFloat(lat1)) * Math.PI) / 180;
    const deltaLambda = ((parseFloat(lon2) - parseFloat(lon1)) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

/**
 * Format Date to YYYY-MM-DD
 * @param {Date} date
 * @returns {String}
 */
export function formatDateYMD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get the authoritative working date for attendance based on server time and shift configuration
 * @param {Date} dateObj
 * @param {Object} [shift]
 * @returns {String} YYYY-MM-DD
 */
export function getWorkingDate(dateObj, shift) {
    const d = new Date(dateObj);

    if (shift && (shift.isOvernight || isShiftOvernight(shift.startTime, shift.endTime))) {
        // For overnight shifts (e.g. 22:00 to 06:00):
        // If current hour is in early morning (00:00 to 12:00), the shift started on previous day
        const hours = d.getHours();
        if (hours < 12) {
            const prevDate = new Date(d);
            prevDate.setDate(prevDate.getDate() - 1);
            return formatDateYMD(prevDate);
        }
    }

    return formatDateYMD(d);
}

/**
 * Check if shift crosses midnight based on start and end time strings
 * @param {String} startTime HH:mm:ss
 * @param {String} endTime HH:mm:ss
 * @returns {Boolean}
 */
export function isShiftOvernight(startTime, endTime) {
    if (!startTime || !endTime) return false;
    return startTime > endTime;
}

/**
 * Parse time string HH:mm:ss or HH:mm into hours, minutes, seconds
 * @param {String} timeStr
 * @returns {{ hours: number, minutes: number, seconds: number }}
 */
function parseTime(timeStr) {
    if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
    const parts = String(timeStr).split(':').map(Number);
    return {
        hours: parts[0] || 0,
        minutes: parts[1] || 0,
        seconds: parts[2] || 0,
    };
}

/**
 * Calculate scheduled shift start and end Date objects for a given working date
 * @param {String} workingDate YYYY-MM-DD
 * @param {Object} shift
 * @returns {{ scheduledStart: Date, scheduledEnd: Date }}
 */
export function getScheduledShiftBounds(workingDate, shift) {
    const [year, month, day] = workingDate.split('-').map(Number);

    const startT = parseTime(shift?.startTime || '09:00:00');
    const endT = parseTime(shift?.endTime || '18:00:00');

    const scheduledStart = new Date(year, month - 1, day, startT.hours, startT.minutes, startT.seconds);
    let scheduledEnd = new Date(year, month - 1, day, endT.hours, endT.minutes, endT.seconds);

    const isOvernight = shift?.isOvernight || isShiftOvernight(shift?.startTime, shift?.endTime);
    if (isOvernight) {
        // Scheduled end is on the next calendar day
        scheduledEnd = new Date(year, month - 1, day + 1, endT.hours, endT.minutes, endT.seconds);
    }

    return { scheduledStart, scheduledEnd };
}

/**
 * Calculate shift metrics (lateMinutes, earlyLeaveMinutes, overtimeMinutes, workDuration, status)
 * using policy rules and thresholds
 * @param {Object} params
 * @param {Date} params.checkIn
 * @param {Date|null} params.checkOut
 * @param {Object} [params.shift]
 * @param {String} params.workingDate
 * @param {Object} [params.policy]
 * @returns {Object}
 */
export function calculateShiftMetrics({ checkIn, checkOut, shift, workingDate, policy = {} }) {
    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let overtimeMinutes = 0;
    let workDuration = 0;
    let status = 'present';

    const gracePeriodMinutes = policy?.gracePeriodMinutes ?? policy?.policyGracePeriodMinutes ?? 15;
    const halfDayThreshold = policy?.halfDayMinutes ?? policy?.policyHalfDayMinutes ?? 240;
    const earlyLeaveGraceMinutes = policy?.earlyLeaveGraceMinutes ?? policy?.policyEarlyLeaveGraceMinutes ?? 15;
    const overtimeEnabled = policy?.overtimeEnabled ?? policy?.policyOvertimeEnabled ?? false;
    const overtimeGraceMinutes = policy?.overtimeGraceMinutes ?? policy?.policyOvertimeGraceMinutes ?? 30;

    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;

    if (shift && workingDate) {
        const { scheduledStart, scheduledEnd } = getScheduledShiftBounds(workingDate, shift);

        if (checkInDate) {
            const graceThreshold = new Date(scheduledStart.getTime() + gracePeriodMinutes * 60000);
            if (checkInDate > graceThreshold) {
                lateMinutes = Math.max(0, Math.floor((checkInDate.getTime() - scheduledStart.getTime()) / 60000));
            }
        }

        if (checkOutDate) {
            const earlyLeaveThreshold = new Date(scheduledEnd.getTime() - earlyLeaveGraceMinutes * 60000);
            if (checkOutDate < earlyLeaveThreshold) {
                earlyLeaveMinutes = Math.max(0, Math.floor((scheduledEnd.getTime() - checkOutDate.getTime()) / 60000));
            }

            if (overtimeEnabled) {
                const overtimeThreshold = new Date(scheduledEnd.getTime() + overtimeGraceMinutes * 60000);
                if (checkOutDate > overtimeThreshold) {
                    overtimeMinutes = Math.max(0, Math.floor((checkOutDate.getTime() - scheduledEnd.getTime()) / 60000));
                }
            }
        }
    }

    if (checkInDate && checkOutDate) {
        workDuration = Math.max(0, Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / 60000));

        if (workDuration < halfDayThreshold) {
            status = 'half_day';
        } else if (lateMinutes > 0) {
            status = 'late';
        } else {
            status = 'present';
        }
    } else if (checkInDate) {
        if (lateMinutes > 0) {
            status = 'late';
        } else {
            status = 'present';
        }
    }

    return {
        lateMinutes,
        earlyLeaveMinutes,
        overtimeMinutes,
        workDuration,
        status,
    };
}

export default {
    extractClientIp,
    extractUserAgent,
    isValidCoordinates,
    calculateDistanceInMeters,
    formatDateYMD,
    getWorkingDate,
    isShiftOvernight,
    getScheduledShiftBounds,
    calculateShiftMetrics,
};
