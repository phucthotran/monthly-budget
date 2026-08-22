/**
 * Ease-out cubic. Gentler than the quintic curve it replaced, which reached
 * nine tenths of the way in the first third of its duration and so read as a
 * snap followed by a crawl rather than one smooth move.
 */
const PAGE_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1]

/** Fade for a page arriving without a gesture. Shared so both platforms match. */
export const PAGE_FADE = { duration: 0.26, ease: PAGE_EASE }

/**
 * Desktop page enter: the fade finishes ahead of the rise, so the content is
 * readable while it is still settling into place.
 */
export const PAGE_ENTER_TRANSITION = { duration: 0.38, ease: PAGE_EASE, opacity: PAGE_FADE }
