/**
 * Email Sequences for AISO Studio Lead Nurturing
 *
 * Sequence 1: Solo Marketer (own_site persona)
 * Sequence 2: Agency (client_site persona)
 */

import { sendEmail } from './email';
import { db, query } from './db';

// Email templates by persona and sequence number
interface EmailTemplate {
  subject: string;
  getBody: (data: EmailData) => string;
}

interface EmailData {
  email: string;
  domain?: string;
  aisoScore?: number;
  persona: string;
}

// ============================================
// SOLO MARKETER SEQUENCE (own_site)
// ============================================

const soloSequence: EmailTemplate[] = [
  // Email 1: Immediate - Here's what we found
  {
    subject: "Your AISO Score: {{score}} - Here's What It Means",
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .score-box { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; border-radius: 16px; text-align: center; margin: 20px 0; }
    .score { font-size: 48px; font-weight: bold; }
    .score-label { font-size: 14px; opacity: 0.9; }
    .section { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #f97316; margin: 0;">AISO Studio</h1>
    </div>

    <p>Hi there,</p>

    <p>Thanks for running a free audit on <strong>${data.domain || 'your website'}</strong>. Here's what we found:</p>

    <div class="score-box">
      <div class="score">${data.aisoScore || '??'}</div>
      <div class="score-label">Your AISO Score</div>
    </div>

    <div class="section">
      <h3 style="margin-top: 0;">What does this mean?</h3>
      ${data.aisoScore && data.aisoScore >= 80 ? `
        <p><strong>Good news!</strong> Your content is performing well for AI search engines. But there's always room to improve.</p>
      ` : data.aisoScore && data.aisoScore >= 60 ? `
        <p><strong>You're on the right track</strong>, but your content could be more visible to AI search engines like ChatGPT, Perplexity, and Google AI Overviews.</p>
      ` : `
        <p><strong>There's significant room for improvement.</strong> AI search engines may have trouble understanding and recommending your content.</p>
      `}
    </div>

    <div class="section">
      <h3 style="margin-top: 0;">Why AI Search Matters</h3>
      <p>More people are using AI assistants to find products, services, and information. If your content isn't optimized for AI, you're invisible to this growing audience.</p>
    </div>

    <p style="text-align: center;">
      <a href="https://aiso.studio/sign-up" class="cta-button">Start Improving Your Score</a>
    </p>

    <p>Tomorrow, I'll send you 3 quick tips to improve your AI visibility - no account needed.</p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Email 2: Day 2 - Tips to improve
  {
    subject: '3 Quick Fixes to Boost Your AI Visibility',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .tip-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #f97316; }
    .tip-number { background: #f97316; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #f97316; margin: 0;">AISO Studio</h1>
    </div>

    <p>Hi there,</p>

    <p>Yesterday you audited ${data.domain || 'your site'}. Here are 3 quick fixes that can improve your AI visibility:</p>

    <div class="tip-box">
      <p><span class="tip-number">1</span> <strong>Add FAQ Sections</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">AI loves direct Q&A content. Add a FAQ section to your key pages with questions your customers actually ask.</p>
    </div>

    <div class="tip-box">
      <p><span class="tip-number">2</span> <strong>Use Clear, Concise Answers</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">Start paragraphs with direct answers. AI snippets often pull the first sentence, so make it count.</p>
    </div>

    <div class="tip-box">
      <p><span class="tip-number">3</span> <strong>Add Structured Data (Schema)</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">FAQ schema, Article schema, and LocalBusiness schema help AI understand your content better.</p>
    </div>

    <p><strong>Want the full breakdown?</strong> Your free audit showed exactly which areas need work. Sign up to see the detailed recommendations.</p>

    <p style="text-align: center;">
      <a href="https://aiso.studio/sign-up" class="cta-button">See My Full Report</a>
    </p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Email 3: Day 5 - Trial CTA
  {
    subject: 'Your 7-Day Free Trial is Waiting',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .feature-list { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .feature-item { display: flex; align-items: flex-start; margin: 12px 0; }
    .check { color: #22c55e; font-size: 20px; margin-right: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; font-size: 16px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #f97316; margin: 0;">AISO Studio</h1>
    </div>

    <p>Hi there,</p>

    <p>A few days ago you discovered your AISO score${data.aisoScore ? ` was ${data.aisoScore}` : ''}. Ready to improve it?</p>

    <p><strong>Start your free 7-day trial</strong> and get:</p>

    <div class="feature-list">
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Unlimited content audits</strong> - Check any page, anytime</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>AI-powered rewrites</strong> - Fix issues with one click</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Content strategy generator</strong> - 15 optimized topics</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Full article generation</strong> - Blog posts that score 80+</span>
      </div>
    </div>

    <p style="text-align: center;">
      <a href="https://aiso.studio/sign-up" class="cta-button">Start Free Trial</a>
    </p>

    <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 10px;">
      No credit card required • Cancel anytime
    </p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },
];

// ============================================
// AGENCY SEQUENCE (client_site)
// ============================================

const agencySequence: EmailTemplate[] = [
  // Email 1: Immediate - Results + Agency angle
  {
    subject: "Your Client's AISO Score: {{score}} - Sales Opportunity?",
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .score-box { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 30px; border-radius: 16px; text-align: center; margin: 20px 0; }
    .score { font-size: 48px; font-weight: bold; }
    .score-label { font-size: 14px; opacity: 0.9; }
    .section { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #7c3aed; margin: 0;">AISO Studio</h1>
      <p style="color: #64748b; margin: 5px 0 0 0;">For Marketing Agencies</p>
    </div>

    <p>Hi there,</p>

    <p>You audited <strong>${data.domain || 'a client site'}</strong>. Here's what we found:</p>

    <div class="score-box">
      <div class="score">${data.aisoScore || '??'}</div>
      <div class="score-label">AISO Score</div>
    </div>

    ${data.aisoScore && data.aisoScore < 70 ? `
    <div class="section" style="border-left: 4px solid #22c55e;">
      <h3 style="margin-top: 0; color: #22c55e;">💰 Sales Opportunity</h3>
      <p>This score suggests there's significant room for improvement. This could be a strong pitch for AI Search Optimization services.</p>
    </div>
    ` : ''}

    <div class="section">
      <h3 style="margin-top: 0;">How Agencies Use AISO Studio</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Prospect audits</strong> - Find issues, pitch solutions</li>
        <li><strong>Client reporting</strong> - Show before/after improvements</li>
        <li><strong>Content production</strong> - Generate optimized posts at scale</li>
        <li><strong>White-label PDFs</strong> - Your branding, professional reports</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="https://aiso.studio/sign-up" class="cta-button">Start Agency Trial</a>
    </p>

    <p>Tomorrow, I'll show you how to turn audit results into closed deals.</p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Email 2: Day 2 - How to pitch AI SEO
  {
    subject: 'How to Pitch AI Search Optimization to Clients',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .pitch-box { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #7c3aed; }
    .step-number { background: #7c3aed; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #7c3aed; margin: 0;">AISO Studio</h1>
      <p style="color: #64748b; margin: 5px 0 0 0;">For Marketing Agencies</p>
    </div>

    <p>Hi there,</p>

    <p>Here's a proven 3-step process for turning audit results into new business:</p>

    <div class="pitch-box">
      <p><span class="step-number">1</span> <strong>Lead with the Score</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">"We audited your site for AI search visibility. You scored ${data.aisoScore || 'XX'}/100. Here's why that matters..."</p>
    </div>

    <div class="pitch-box">
      <p><span class="step-number">2</span> <strong>Explain the Trend</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">"More people search with AI now - ChatGPT, Perplexity, Google AI Overviews. If your content isn't optimized, you're invisible to this audience."</p>
    </div>

    <div class="pitch-box">
      <p><span class="step-number">3</span> <strong>Show Competitor Gap</strong></p>
      <p style="margin-left: 38px; margin-bottom: 0;">"Your competitors are ranking higher for AI search. We can help you catch up - or get ahead."</p>
    </div>

    <p><strong>The tool to make this easy?</strong> AISO Studio generates proposals, comparison reports, and white-label PDFs automatically.</p>

    <p style="text-align: center;">
      <a href="https://aiso.studio/sign-up" class="cta-button">Try the Agency Tools</a>
    </p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Email 3: Day 5 - Scale pitch
  {
    subject: 'Scale Your Content Production 10x',
    getBody: (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .feature-list { background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .feature-item { display: flex; align-items: flex-start; margin: 12px 0; }
    .check { color: #7c3aed; font-size: 20px; margin-right: 10px; }
    .tier-box { background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: white; color: #7c3aed; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; font-size: 16px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #7c3aed; margin: 0;">AISO Studio</h1>
      <p style="color: #64748b; margin: 5px 0 0 0;">For Marketing Agencies</p>
    </div>

    <p>Hi there,</p>

    <p>What if you could deliver 10x the content without hiring more writers?</p>

    <p><strong>AISO Studio Agency tier</strong> gives you:</p>

    <div class="feature-list">
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Unlimited audits</strong> - Prospect anyone, anytime</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Bulk content generation</strong> - Generate all 15 topics at once</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>White-label PDF reports</strong> - Your logo, your branding</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>WordPress integration</strong> - Publish with one click</span>
      </div>
      <div class="feature-item">
        <span class="check">✓</span>
        <span><strong>Unlimited clients</strong> - No per-seat charges</span>
      </div>
    </div>

    <div class="tier-box">
      <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">Agency Tier</p>
      <p style="margin: 0; font-size: 36px; font-weight: bold;">$599<span style="font-size: 16px; font-weight: normal;">/month</span></p>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Unlimited everything</p>
      <a href="https://aiso.studio/sign-up" class="cta-button">Start 7-Day Free Trial</a>
    </div>

    <p style="text-align: center; color: #64748b; font-size: 14px;">
      No credit card required • Cancel anytime
    </p>

    <p>Best,<br>The AISO Studio Team</p>

    <div class="footer">
      <p>You received this because you ran a free audit at aiso.studio</p>
      <p><a href="https://aiso.studio/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #64748b;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
    `,
  },
];

// ============================================
// EMAIL SEQUENCE PROCESSOR
// ============================================

/**
 * Get the appropriate sequence for a persona
 */
function getSequence(persona: string): EmailTemplate[] {
  return persona === 'client_site' ? agencySequence : soloSequence;
}

/**
 * Send an email from a sequence
 */
export async function sendSequenceEmail(
  leadId: string,
  email: string,
  persona: string,
  emailNumber: number,
  data: EmailData
): Promise<boolean> {
  const sequence = getSequence(persona);

  if (emailNumber < 1 || emailNumber > sequence.length) {
    console.error(`Invalid email number: ${emailNumber}`);
    return false;
  }

  const template = sequence[emailNumber - 1];

  // Replace template variables in subject
  let subject = template.subject
    .replace('{{score}}', String(data.aisoScore || '??'))
    .replace('{{domain}}', data.domain || 'your site');

  const body = template.getBody(data);

  try {
    const result = await sendEmail({
      to: email,
      subject,
      html: body,
    });

    // Log the email send
    await query(
      `INSERT INTO email_sequence_logs (
        captured_lead_id, email_number, email_type, sent_at, subject, ses_message_id
      ) VALUES ($1, $2, $3, NOW(), $4, $5)`,
      [leadId, emailNumber, getEmailType(emailNumber), subject, result?.data?.id || null]
    );

    // Update lead status
    const statusMap: Record<number, string> = {
      1: 'email_1_sent',
      2: 'email_2_sent',
      3: 'completed',
    };

    await db.updateCapturedLead(leadId, {
      email_sequence_status: statusMap[emailNumber],
    });

    console.log(`[Email Sequence] Sent email ${emailNumber} to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Sequence] Failed to send email ${emailNumber} to ${email}:`, error);
    return false;
  }
}

function getEmailType(emailNumber: number): string {
  const types: Record<number, string> = {
    1: 'results',
    2: 'tips',
    3: 'trial_cta',
  };
  return types[emailNumber] || 'unknown';
}

/**
 * Process pending email sequences (call from cron job or Inngest)
 */
export async function processEmailSequences(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const stats = { processed: 0, sent: 0, errors: 0 };

  try {
    // Get leads that need emails
    // Email 1: Immediate (pending status)
    // Email 2: 2 days after email 1
    // Email 3: 5 days after email 1
    const leads = await query(`
      SELECT cl.*, esl.email_number as last_email_sent
      FROM captured_leads cl
      LEFT JOIN (
        SELECT captured_lead_id, MAX(email_number) as email_number
        FROM email_sequence_logs
        GROUP BY captured_lead_id
      ) esl ON cl.id = esl.captured_lead_id
      WHERE cl.email_sequence_status NOT IN ('completed', 'unsubscribed')
      AND (
        -- Email 1: Never sent
        (esl.email_number IS NULL AND cl.email_sequence_status = 'pending')
        -- Email 2: 2 days after creation, email 1 sent
        OR (esl.email_number = 1 AND cl.created_at < NOW() - INTERVAL '2 days')
        -- Email 3: 5 days after creation, email 2 sent
        OR (esl.email_number = 2 AND cl.created_at < NOW() - INTERVAL '5 days')
      )
      ORDER BY cl.created_at ASC
      LIMIT 50
    `);

    for (const lead of leads) {
      stats.processed++;

      const nextEmailNumber = (lead.last_email_sent || 0) + 1;

      if (nextEmailNumber > 3) continue;

      const success = await sendSequenceEmail(
        lead.id,
        lead.email,
        lead.persona,
        nextEmailNumber,
        {
          email: lead.email,
          domain: lead.domain,
          aisoScore: lead.aiso_score,
          persona: lead.persona,
        }
      );

      if (success) {
        stats.sent++;
      } else {
        stats.errors++;
      }

      // Small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('[Email Sequence] Processing error:', error);
  }

  return stats;
}

export { soloSequence, agencySequence };
