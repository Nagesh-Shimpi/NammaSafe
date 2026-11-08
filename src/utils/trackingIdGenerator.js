/**
 * Utility for generating and validating ResolveTrack Complaint Tracking IDs.
 * Canonical format: RTK-YYYY-XXXXXX (e.g. RTK-2026-000001, RTK-2026-000002)
 * Ensures zero duplication, maintains sequential counter in application state,
 * and preserves legacy tokens (e.g. GRV-2024-xxxx).
 */

export const generateNextTrackingId = (complaintsList = [], year = 2026) => {
  let highestSequence = 0;

  if (Array.isArray(complaintsList)) {
    complaintsList.forEach((complaint) => {
      const id = complaint?.token || complaint?.id || '';
      // Look for canonical RTK-YYYY-XXXXXX
      const rtkMatch = id.match(/^RTK-(\d{4})-(\d{6})$/i);
      if (rtkMatch) {
        const parsedYear = parseInt(rtkMatch[1], 10);
        const parsedSeq = parseInt(rtkMatch[2], 10);
        if (parsedYear === year && !isNaN(parsedSeq) && parsedSeq > highestSequence) {
          highestSequence = parsedSeq;
        }
      }
    });
  }

  const nextSeq = highestSequence + 1;
  const padded = String(nextSeq).padStart(6, '0');
  return `RTK-${year}-${padded}`;
};

/**
 * Validates tracking ID format (supports both canonical RTK-2026-XXXXXX and legacy GRV-YYYY-XXXX)
 */
export const isValidTrackingId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const canonical = /^RTK-\d{4}-\d{6}$/i;
  const legacy = /^GRV-\d{4}-\d{4,6}$/i;
  return canonical.test(id.trim()) || legacy.test(id.trim());
};

