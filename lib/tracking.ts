/**
 * Client-side interaction tracking for email signup funnel
 * Persists tracking data in sessionStorage/localStorage for later insert
 */

const STORAGE_KEY = 'scopedocs_tracking';
const SESSION_KEY = 'scopedocs_session_id';
const ANONYMOUS_KEY = 'scopedocs_anonymous_id';
const LANDING_URL_KEY = 'scopedocs_landing_url';

// Flag to prevent infinite recursion during initialization
let isInitializing = false;

/**
 * Create a minimal default tracking context
 * Used to prevent recursion and as fallback
 */
const createDefaultContext = (): TrackingContext => {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    landing_url: null,
    page_path: null,
    referrer_url: null,
    timezone: null,
    device_type: 'desktop',
    os: null,
    browser: null,
    user_agent: null,
    session_id: getSessionId(),
    anonymous_id: getAnonymousId(),
    cta_clicked: false,
    cta_click_count: 0,
    first_cta_at: null,
    last_cta_at: null,
    signup_step: 'viewed_landing',
    signup_completed: false,
    signup_completed_at: null,
    last_seen_at: new Date().toISOString(),
    events_count: 0,
    country: null,
    region: null,
    city: null,
    ip_hash: null,
  };
};

interface TrackingContext {
  // UTM parameters
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  
  // Page context
  landing_url: string | null;
  page_path: string | null;
  referrer_url: string | null;
  timezone: string | null;
  
  // Device & environment
  device_type: string;
  os: string | null;
  browser: string | null;
  user_agent: string | null;
  
  // Session & identity
  session_id: string;
  anonymous_id: string;
  
  // Interaction & funnel state
  cta_clicked: boolean;
  cta_click_count: number;
  first_cta_at: string | null;
  last_cta_at: string | null;
  signup_step: string;
  signup_completed: boolean;
  signup_completed_at: string | null;
  last_seen_at: string;
  events_count: number;
  
  // Location (requires server-side enrichment or trusted geo endpoint)
  // TODO: requires server-side enrichment or trusted geo endpoint
  country: string | null;
  region: string | null;
  city: string | null;
  ip_hash: string | null; // Never store raw IP in client code
}

/**
 * Parse UTM parameters from URL
 */
const getUTMParams = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_term: params.get('utm_term') || null,
    utm_content: params.get('utm_content') || null,
  };
};

/**
 * Parse user agent to detect device type, OS, and browser
 */
const parseUserAgent = () => {
  if (typeof navigator === 'undefined') {
    return { device_type: 'desktop', os: null, browser: null, user_agent: null };
  }
  
  const ua = navigator.userAgent || '';
  
  // Device type
  let deviceType = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }

  // OS detection
  let os: string | null = null;
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  }

  // Browser detection
  let browser: string | null = null;
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Chrome';
  } else if (/firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
  }

  return {
    device_type: deviceType,
    os: os,
    browser: browser,
    user_agent: ua || null,
  };
};

/**
 * Get or generate session ID
 */
const getSessionId = (): string => {
  if (typeof sessionStorage === 'undefined') {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Get or generate anonymous ID
 */
const getAnonymousId = (): string => {
  if (typeof localStorage === 'undefined') {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let anonymousId = localStorage.getItem(ANONYMOUS_KEY);
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(ANONYMOUS_KEY, anonymousId);
  }
  return anonymousId;
};

/**
 * Get landing URL (first URL visitor landed on, persist in localStorage)
 */
const getLandingUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LANDING_URL_KEY);
    if (stored) {
      return stored;
    }
    // Store current URL as landing URL if not set
    const currentUrl = window.location.href;
    localStorage.setItem(LANDING_URL_KEY, currentUrl);
    return currentUrl;
  }
  
  return window.location.href || null;
};

/**
 * Get timezone
 */
const getTimezone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
};

/**
 * Save tracking context to storage
 */
const saveTrackingContext = (context: Partial<TrackingContext>) => {
  if (typeof localStorage === 'undefined') return;
  
  try {
    // Get existing context without triggering init (to prevent recursion)
    let existing: TrackingContext;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        existing = JSON.parse(stored) as TrackingContext;
      } else {
        // If no stored context, create minimal default to avoid recursion
        existing = createDefaultContext();
      }
    } catch (parseError) {
      // If parsing fails, create minimal default
      existing = createDefaultContext();
    }
    
    const updated = { ...existing, ...context };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save tracking context:', error);
  }
};

/**
 * Initialize tracking context on page load
 * Should be called once when the page/component mounts
 */
export const initTrackingContext = (): TrackingContext => {
  // Prevent recursive calls
  if (isInitializing) {
    // Return minimal default if already initializing
    return createDefaultContext();
  }
  
  isInitializing = true;
  const now = new Date().toISOString();
  
  try {
    // Check if we already have tracking context (directly from localStorage to avoid recursion)
    let existing: TrackingContext | null = null;
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          existing = JSON.parse(stored) as TrackingContext;
        }
      } catch (parseError) {
        // Ignore parse errors, will create new context
      }
    }
    
    if (existing && existing.landing_url) {
      // Update last_seen_at but keep existing context
      existing.last_seen_at = now;
      saveTrackingContext({ last_seen_at: now });
      return existing;
    }
    
    // Initialize new tracking context
    const utmParams = getUTMParams();
    const deviceInfo = parseUserAgent();
    const landingUrl = getLandingUrl();
    
    const context: TrackingContext = {
      // UTM parameters
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_term: utmParams.utm_term || null,
      utm_content: utmParams.utm_content || null,
      
      // Page context
      landing_url: landingUrl,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      referrer_url: typeof document !== 'undefined' ? (document.referrer || null) : null,
      timezone: getTimezone(),
      
      // Device & environment
      ...deviceInfo,
      
      // Session & identity
      session_id: getSessionId(),
      anonymous_id: getAnonymousId(),
      
      // Interaction & funnel state
      cta_clicked: false,
      cta_click_count: 0,
      first_cta_at: null,
      last_cta_at: null,
      signup_step: 'viewed_landing',
      signup_completed: false,
      signup_completed_at: null,
      last_seen_at: now,
      events_count: 0,
      
      // Location (requires server-side enrichment or trusted geo endpoint)
      // TODO: requires server-side enrichment or trusted geo endpoint
      country: null,
      region: null,
      city: null,
      ip_hash: null, // Never store raw IP in client code
    };
    
    saveTrackingContext(context);
    return context;
  } finally {
    isInitializing = false;
  }
};

/**
 * Track CTA click (Get Started Now button)
 */
export const trackCtaClick = (): void => {
  const context = getTrackingContext();
  const now = new Date().toISOString();
  
  const updates: Partial<TrackingContext> = {
    cta_clicked: true,
    cta_click_count: context.cta_click_count + 1,
    last_cta_at: now,
    last_seen_at: now,
    events_count: context.events_count + 1,
  };
  
  // Set first_cta_at only if it's the first click
  if (!context.first_cta_at) {
    updates.first_cta_at = now;
  }
  
  saveTrackingContext(updates);
};

/**
 * Track modal/popup open
 */
export const trackModalOpen = (): void => {
  const context = getTrackingContext();
  const now = new Date().toISOString();
  
  const updates: Partial<TrackingContext> = {
    signup_step: 'opened_modal',
    last_seen_at: now,
    events_count: context.events_count + 1,
  };
  
  saveTrackingContext(updates);
};

/**
 * Track email input (first non-empty)
 */
export const trackEmailTyped = (): void => {
  const context = getTrackingContext();
  
  // Only track if we haven't already tracked email entry
  if (context.signup_step === 'entered_email' || context.signup_step === 'submitted') {
    return;
  }
  
  const now = new Date().toISOString();
  const updates: Partial<TrackingContext> = {
    signup_step: 'entered_email',
    last_seen_at: now,
    events_count: context.events_count + 1,
  };
  
  saveTrackingContext(updates);
};

/**
 * Track submit (before actual submission)
 */
export const trackSubmit = (): void => {
  const context = getTrackingContext();
  const now = new Date().toISOString();
  
  const updates: Partial<TrackingContext> = {
    signup_step: 'submitted',
    last_seen_at: now,
    events_count: context.events_count + 1,
  };
  
  saveTrackingContext(updates);
};

/**
 * Mark signup as completed (after successful insert)
 */
export const markSignupCompleted = (): void => {
  const now = new Date().toISOString();
  const updates: Partial<TrackingContext> = {
    signup_completed: true,
    signup_completed_at: now,
    last_seen_at: now,
  };
  
  saveTrackingContext(updates);
};

/**
 * Get current tracking context for insert
 */
export const getTrackingContext = (): TrackingContext => {
  if (typeof localStorage === 'undefined') {
    // Return default context if localStorage not available
    return createDefaultContext();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as TrackingContext;
    }
  } catch (error) {
    console.warn('Failed to load tracking context:', error);
  }
  
  // If no stored context and not already initializing, initialize it
  // Otherwise return minimal default to prevent recursion
  if (!isInitializing) {
    return initTrackingContext();
  } else {
    // Return minimal default if already initializing to prevent recursion
    return createDefaultContext();
  }
};
