import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  initTrackingContext,
  trackCtaClick,
  trackEmailTyped,
  trackSubmit,
  markSignupCompleted,
  getTrackingContext,
} from '../lib/tracking';

interface EmailSignupProps {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  buttonText?: string;
}

interface EmailSignupRecord {
  id?: number;
  emails: string;
  created_at?: string;
  [key: string]: any; // Allow additional tracking fields
}

// Helper function for timestamped logging
const log = (level: 'info' | 'error', message: string) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
  console.log(`${timestamp} [${level}] ${message}`);
};

// Helper function to get timezone abbreviation (EST, MT, CT, etc.)
const getTimezoneAbbreviation = (): string => {
  try {
    const date = new Date();
    const timeZoneName = Intl.DateTimeFormat('en', {
      timeZoneName: 'short',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value;
    
    // Return the abbreviation (e.g., EST, EDT, PST, etc.)
    return timeZoneName || 'UTC';
  } catch (err) {
    // Fallback: calculate from offset
    const offset = -new Date().getTimezoneOffset() / 60;
    if (offset === -5) return 'EST';
    if (offset === -6) return 'CST';
    if (offset === -7) return 'MST';
    if (offset === -8) return 'PST';
    return `UTC${offset >= 0 ? '+' : ''}${offset}`;
  }
};

export default function EmailSignup({
  className = 'input',
  inputClassName = 'email-input',
  buttonClassName = 'button-4',
  placeholder = 'Email Address Here',
  buttonText = 'Get Started Now'
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [hasTrackedEmailTyped, setHasTrackedEmailTyped] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Initialize tracking on mount
  useEffect(() => {
    initTrackingContext();
  }, []);

  // Track email input (first non-empty)
  useEffect(() => {
    if (email.trim() && !hasTrackedEmailTyped) {
      trackEmailTyped();
      setHasTrackedEmailTyped(true);
    }
  }, [email, hasTrackedEmailTyped]);

  const validateEmail = (email: string) => {
    return email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle CTA click
  const handleCtaClick = () => {
    trackCtaClick();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log('info', 'Form submission started');
    
    // Track CTA click
    trackCtaClick();
    
    if (!validateEmail(email)) {
      log('error', 'Email validation failed');
      return;
    }

    // Track submit
    trackSubmit();

    log('info', 'Email validation passed');
    log('info', `Preparing to insert email: ${email.trim()}`);
    
    setLoading(true);
    setSuccess(false);

    try {
      log('info', 'Checking Supabase client initialization');
      if (!supabase) {
        log('error', 'Supabase client is not initialized');
        return;
      }
      log('info', 'Supabase client is initialized');

      const emailToSave = email.trim().toLowerCase(); // Normalize to lowercase for case-insensitive check
      log('info', `📧 Checking if email exists: ${emailToSave}`);
      
      // First, check if email already exists (case-insensitive check)
      // Use ilike for case-insensitive matching in PostgreSQL/Supabase
      let emailExists = false;
      try {
        // Try case-insensitive check first (ilike)
        const { data: ilikeData, error: ilikeError } = await supabase
          .from('email_signups')
          .select('emails')
          .ilike('emails', emailToSave)
          .limit(1);

        if (!ilikeError && ilikeData && ilikeData.length > 0) {
          emailExists = true;
          log('info', '📧 Email already exists in database (case-insensitive check via ilike)');
        } else if (ilikeError) {
          // If ilike fails, try regular eq() as fallback (case-sensitive)
          log('error', `ilike check failed, trying case-sensitive check: ${ilikeError.message}`);
          const { data: existingData, error: checkError } = await supabase
            .from('email_signups')
            .select('emails')
            .eq('emails', emailToSave)
            .limit(1);

          if (checkError) {
            log('error', `Error checking existing email (will proceed with insert): ${checkError.message}`);
            emailExists = false;
          } else {
            emailExists = existingData !== null && existingData !== undefined && existingData.length > 0;
            log('info', emailExists ? '📧 Email already exists in database (case-sensitive check)' : '📧 Email is new');
          }
        } else {
          log('info', '📧 Email is new (not found in database)');
        }
      } catch (checkErr) {
        log('error', `Exception during email check (will proceed with insert): ${checkErr}`);
        emailExists = false;
      }

      setIsExistingUser(emailExists);

      if (emailExists) {
        log('info', '📧 Email already exists, skipping insert to prevent duplicate');
        // Still mark signup as completed for tracking
        markSignupCompleted();
        
        setSubmittedEmail(emailToSave);
        setSuccess(true);
        setEmail('');
        setLoading(false);
        return;
      }

      log('info', `💾 Saving NEW email to Supabase: ${emailToSave}`);
      log('info', `Connecting to Supabase at https://saunsibblswdulijmejy.supabase.co`);
      log('info', `Insert email into email_signups table`);

      // Create timestamp with local timezone
      const now = new Date();
      const timezoneOffset = -now.getTimezoneOffset(); // offset in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      
      // Get timezone abbreviation (EST, MT, CT, etc.)
      const timezoneAbbreviation = getTimezoneAbbreviation();
      
      // Format as ISO string with timezone offset
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const localTimestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
      
      log('info', `Local timestamp with timezone: ${localTimestamp}`);
      log('info', `Timezone abbreviation: ${timezoneAbbreviation}`);
      
      // Get tracking context for insert
      const trackingContext = getTrackingContext();
      log('info', `Tracking context: device=${trackingContext.device_type}, step=${trackingContext.signup_step}, events=${trackingContext.events_count}`);
      
      // Build insert payload with all tracking data
      const insertPayload: any = {
        emails: emailToSave, // Store in lowercase for consistency
        created_at: localTimestamp,
        timezone_abbr: timezoneAbbreviation, // Add timezone abbreviation (EST, MT, CT, etc.)
        ...trackingContext,
        signup_completed: false, // Will be set to true on success
        signup_completed_at: null, // Will be set on success
      };
      
      log('info', `📤 Attempting insert with ${Object.keys(insertPayload).length} fields`);
      log('info', `Payload includes: email, created_at, and ${Object.keys(trackingContext).length} tracking fields`);
      
      const result = await (supabase
        .from('email_signups')
        .insert([insertPayload] as any)
        .select() as any);
      
      let data: EmailSignupRecord[] | null = result.data as EmailSignupRecord[] | null;
      let error = result.error;

      // If insert fails with tracking data, try with just basic fields
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        log('error', '⚠️ Insert with tracking data failed, retrying with basic fields only...');
        log('error', `Original error: ${error.message}`);
        
        const basicPayload = {
          emails: emailToSave,
          created_at: localTimestamp,
          timezone_abbr: timezoneAbbreviation,
        };
        
        const retryResult = await (supabase
          .from('email_signups')
          .insert([basicPayload] as any)
          .select() as any);
        
        data = retryResult.data as EmailSignupRecord[] | null;
        error = retryResult.error;
        
        if (!error) {
          log('info', '✅ Insert successful with basic fields only');
        }
      }

      if (error) {
        log('error', `❌ Insert failed: ${error.message}`);
        log('error', `Error code: ${error.code || 'N/A'}`);
        log('error', `Error details: ${JSON.stringify(error)}`);
        console.error('Full error object:', error);
        
        // Check for specific error types
        if (error.code === '42501') {
          console.error('🔒 RLS Policy Error: Your Supabase table needs an INSERT policy for anonymous users');
          console.error('💡 Go to Supabase Dashboard → Authentication → Policies → Create policy for INSERT');
        } else if (error.code === 'PGRST204') {
          console.error('🔍 Column Error: One or more columns may not exist in the table');
          console.error('💡 Check that all columns exist in your email_signups table');
        } else if (error.code === '23505') {
          console.error('🔍 Unique Constraint: Email might already exist');
          setIsExistingUser(true);
        }
      } else {
        // Mark signup as completed
        markSignupCompleted();
        
        log('info', '✅✅✅ Insert successful!');
        log('info', `✅ Email saved: ${emailToSave}`);
        log('info', `Returned data: ${JSON.stringify(data)}`);
        if (data && data[0]) {
          log('info', `✅ Record ID: ${data[0].id}`);
          log('info', `✅ Total columns saved: ${Object.keys(data[0]).length}`);
          log('info', `✅ All saved fields: ${Object.keys(data[0]).join(', ')}`);
        }
        setSubmittedEmail(emailToSave);
        setSuccess(true);
        setEmail('');
        
        // Clear success state after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setSubmittedEmail('');
          setIsExistingUser(false);
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('error', `Unexpected error: ${errorMessage}`);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
      log('info', 'Form submission completed');
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        type="email"
        className={inputClassName}
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      <button 
        type="submit" 
        className={buttonClassName}
        disabled={loading}
        onClick={handleCtaClick}
      >
        <div className="text-wrapper-7">
          {loading ? 'Submitting...' : buttonText}
        </div>
      </button>

      {success && submittedEmail && (
        <div style={{
          marginTop: '12px',
          color: '#4ade80',
          fontSize: '14px',
          textAlign: 'center',
          fontFamily: 'Figtree, Helvetica',
          opacity: 0.9
        }}>
          {isExistingUser ? (
            <>✓ You've already signed up, {submittedEmail}! You'll receive updates shortly.</>
          ) : (
            <>✓ Thanks for signing up, {submittedEmail}!</>
          )}
        </div>
      )}
    </form>
  );
}
