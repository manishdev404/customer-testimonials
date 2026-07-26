export const MAX_IMAGES = 2;

/** 10 MB raw, times ~1.37 for base64 overhead, plus headroom for the wrapper. */
export const MAX_IMAGE_PAYLOAD_BYTES = 14 * 1024 * 1024;

export const MESSAGE_MIN_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 600;
export const NAME_MAX_LENGTH = 60;
export const COMPANY_MAX_LENGTH = 60;

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** A review counts as "positive" in the stats at this rating or above. */
export const POSITIVE_RATING_THRESHOLD = 4;

/**
 * A resubmission from the same email within this window is treated as a
 * duplicate rather than a second testimonial.
 */
export const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
