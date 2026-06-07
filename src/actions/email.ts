'use server'

import { resend } from '@/utils/resend/server';
import { createClient } from '@/utils/supabase/server';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // e.g. 'JointJourney <noreply@yourdomain.com>'
}

/**
 * A reusable Server Action for sending transactional emails via Resend.
 * Call this from Server Components, Route Handlers, or Client Components.
 */
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = 'JointJourney <noreply@yourdomain.com>' 
}: SendEmailOptions) {
  try {
    // (Optional) Enforce authentication for this action
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return { success: false, error: 'Unauthorized' };
    // }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[Resend Exception]', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
