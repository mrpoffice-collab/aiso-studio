require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    // Find Kim's user record
    const userResult = await sql`SELECT * FROM users WHERE email ILIKE '%kim%'`;
    if (userResult.length === 0) {
      console.log('No user found with kim in email');
      return;
    }
    const user = userResult[0];
    console.log('=== User Record ===');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Logo URL:', user.agency_logo_url);
    console.log('Primary Color:', user.agency_primary_color);
    console.log('Agency Email:', user.agency_email);
    console.log('Agency Phone:', user.agency_phone);
    console.log('Signature Name:', user.signature_name);
    console.log('Signature Title:', user.signature_title);

    // Check audits
    const auditResult = await sql`SELECT COUNT(*) as count FROM accessibility_audits WHERE user_id = ${user.id}`;
    console.log('\n=== Audits ===');
    console.log('Audit count:', auditResult[0].count);

    // Summary of what should be complete
    console.log('\n=== Onboarding Status ===');
    const hasAgencyName = !!user.name && user.name.length > 0;
    const hasLogo = !!user.agency_logo_url && user.agency_logo_url.length > 0;
    const hasColors = !!user.agency_primary_color && user.agency_primary_color !== '#6366f1';
    const hasContactInfo = !!(user.agency_email || user.agency_phone);
    const hasSignature = !!(user.signature_name && user.signature_title);
    const hasAudit = parseInt(auditResult[0].count) > 0;

    console.log('agency-name:', hasAgencyName ? 'COMPLETE' : 'INCOMPLETE', `(${user.name || 'null'})`);
    console.log('logo:', hasLogo ? 'COMPLETE' : 'INCOMPLETE', `(${user.agency_logo_url || 'null'})`);
    console.log('colors:', hasColors ? 'COMPLETE' : 'INCOMPLETE', `(${user.agency_primary_color || 'null'}, default is #6366f1)`);
    console.log('contact:', hasContactInfo ? 'COMPLETE' : 'INCOMPLETE', `(email: ${user.agency_email || 'null'}, phone: ${user.agency_phone || 'null'})`);
    console.log('signature:', hasSignature ? 'COMPLETE' : 'INCOMPLETE', `(name: ${user.signature_name || 'null'}, title: ${user.signature_title || 'null'})`);
    console.log('first-audit:', hasAudit ? 'COMPLETE' : 'INCOMPLETE', `(count: ${auditResult[0].count})`);

    const allComplete = hasAgencyName && hasLogo && hasColors && hasContactInfo && hasSignature && hasAudit;
    console.log('\nAll steps complete:', allComplete);

  } catch (error) {
    console.error('Error:', error);
  }
}
check();
