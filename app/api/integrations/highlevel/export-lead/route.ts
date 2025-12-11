import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { pushLeadToHighLevel, createOpportunityFromLead, HighLevelConfig } from '@/lib/highlevel';

/**
 * POST /api/integrations/highlevel/export-lead
 * Export a lead from AISO to HighLevel CRM
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Lead identification - either leadId from pipeline or direct data
      leadId,
      // Or direct lead data
      email,
      name,
      firstName,
      lastName,
      phone,
      companyName,
      website,
      aisoScore,
      sourceUrl,
      persona,
      // Options
      createOpportunity = false,
      estimatedValue,
    } = body;

    // Get user's HighLevel credentials
    const userResult = await query(
      `SELECT
        highlevel_api_key,
        highlevel_location_id,
        highlevel_pipeline_id,
        highlevel_pipeline_stage_id,
        highlevel_aiso_score_field_id,
        highlevel_aiso_source_field_id
      FROM users
      WHERE clerk_id = $1`,
      [userId]
    );

    if (userResult.length === 0 || !userResult[0].highlevel_api_key) {
      return NextResponse.json(
        { error: 'HighLevel not connected. Please configure in Settings.' },
        { status: 400 }
      );
    }

    const user = userResult[0];
    const config: HighLevelConfig = {
      apiKey: user.highlevel_api_key,
      locationId: user.highlevel_location_id,
      pipelineId: user.highlevel_pipeline_id,
      pipelineStageId: user.highlevel_pipeline_stage_id,
      aisoScoreFieldId: user.highlevel_aiso_score_field_id,
      aisoSourceFieldId: user.highlevel_aiso_source_field_id,
    };

    // If leadId is provided, fetch lead data from database
    let leadData = {
      email,
      name,
      firstName,
      lastName,
      phone,
      companyName,
      website,
      aisoScore,
      sourceUrl,
      persona,
    };

    if (leadId) {
      // Try to get from pipeline_leads first
      const pipelineResult = await query(
        `SELECT
          email,
          name as company_name,
          website,
          aiso_score,
          phone,
          contact_name
        FROM pipeline_leads
        WHERE id = $1 AND user_id = (SELECT id FROM users WHERE clerk_id = $2)`,
        [leadId, userId]
      );

      if (pipelineResult.length > 0) {
        const lead = pipelineResult[0];
        leadData = {
          ...leadData,
          email: leadData.email || lead.email,
          companyName: leadData.companyName || lead.company_name,
          website: leadData.website || lead.website,
          aisoScore: leadData.aisoScore ?? lead.aiso_score,
          phone: leadData.phone || lead.phone,
          name: leadData.name || lead.contact_name,
          sourceUrl: leadData.sourceUrl || lead.website,
        };
      } else {
        // Try captured_leads table
        const capturedResult = await query(
          `SELECT email, persona, domain, aiso_score
           FROM captured_leads
           WHERE id = $1`,
          [leadId]
        );

        if (capturedResult.length > 0) {
          const lead = capturedResult[0];
          leadData = {
            ...leadData,
            email: leadData.email || lead.email,
            persona: leadData.persona || lead.persona,
            website: leadData.website || lead.domain,
            aisoScore: leadData.aisoScore ?? lead.aiso_score,
            sourceUrl: leadData.sourceUrl || lead.domain,
          };
        }
      }
    }

    // Validate we have minimum required data
    if (!leadData.email) {
      return NextResponse.json(
        { error: 'Email is required to export lead' },
        { status: 400 }
      );
    }

    // Push contact to HighLevel
    const contactResult = await pushLeadToHighLevel(config, {
      email: leadData.email,
      name: leadData.name,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      phone: leadData.phone,
      companyName: leadData.companyName,
      website: leadData.website,
      aisoScore: leadData.aisoScore,
      sourceUrl: leadData.sourceUrl,
      persona: leadData.persona as 'own_site' | 'client_site' | undefined,
    });

    if (!contactResult.success) {
      return NextResponse.json(
        { error: 'Failed to create contact in HighLevel', details: contactResult.error },
        { status: 500 }
      );
    }

    let opportunityId: string | undefined;

    // Optionally create an opportunity
    if (createOpportunity && contactResult.contactId && config.pipelineId) {
      const oppResult = await createOpportunityFromLead(config, contactResult.contactId, {
        name: leadData.name,
        companyName: leadData.companyName,
        website: leadData.website,
        aisoScore: leadData.aisoScore,
        estimatedValue,
      });

      if (oppResult.success) {
        opportunityId = oppResult.opportunityId;
      }
      // Don't fail the whole request if opportunity creation fails
    }

    // Update the pipeline_lead to mark as exported
    if (leadId) {
      await query(
        `UPDATE pipeline_leads
         SET highlevel_contact_id = $1,
             highlevel_opportunity_id = $2,
             highlevel_exported_at = NOW()
         WHERE id = $3`,
        [contactResult.contactId, opportunityId || null, leadId]
      );
    }

    return NextResponse.json({
      success: true,
      contactId: contactResult.contactId,
      opportunityId,
      message: opportunityId
        ? 'Lead exported to HighLevel with opportunity created'
        : 'Lead exported to HighLevel',
    });
  } catch (error) {
    console.error('Error exporting lead to HighLevel:', error);
    return NextResponse.json(
      { error: 'Failed to export lead' },
      { status: 500 }
    );
  }
}
