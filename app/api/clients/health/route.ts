import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

/**
 * GET /api/clients/health
 * Get health status for all clients (won leads)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all clients (won leads) with their latest audit data
    const clients = await query(
      `SELECT
        l.id,
        l.business_name,
        l.domain,
        l.industry,
        l.status,
        l.overall_score,
        l.estimated_monthly_value,
        l.discovered_at,
        l.updated_at,
        (
          SELECT created_at FROM content_audits
          WHERE user_id = $1 AND url LIKE '%' || l.domain || '%'
          ORDER BY created_at DESC LIMIT 1
        ) as last_audit_date,
        (
          SELECT COUNT(*) FROM content_audits
          WHERE user_id = $1 AND url LIKE '%' || l.domain || '%'
        ) as total_audits,
        (
          SELECT COUNT(*) FROM strategies
          WHERE user_id = $1 AND (website_url LIKE '%' || l.domain || '%' OR client_name = l.business_name)
        ) as total_strategies,
        (
          SELECT COUNT(*) FROM lead_emails
          WHERE lead_id = l.id
        ) as total_emails
       FROM leads l
       WHERE l.user_id = $1 AND l.status = 'won'
       ORDER BY l.business_name ASC`,
      [user.id]
    );

    // Calculate health status for each client
    const now = new Date();
    const clientsWithHealth = clients.map((client: any) => {
      const daysSinceLastAudit = client.last_audit_date
        ? Math.floor((now.getTime() - new Date(client.last_audit_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      let healthStatus: 'healthy' | 'attention' | 'at-risk' | 'new';
      let healthReason: string;

      if (!client.last_audit_date) {
        healthStatus = 'new';
        healthReason = 'No audits performed yet';
      } else if (daysSinceLastAudit! <= 30) {
        healthStatus = 'healthy';
        healthReason = 'Recently audited';
      } else if (daysSinceLastAudit! <= 60) {
        healthStatus = 'attention';
        healthReason = `Last audit ${daysSinceLastAudit} days ago`;
      } else {
        healthStatus = 'at-risk';
        healthReason = `No audit in ${daysSinceLastAudit} days`;
      }

      // Adjust based on score
      if (client.overall_score && client.overall_score < 50 && healthStatus === 'healthy') {
        healthStatus = 'attention';
        healthReason = 'Low overall score needs improvement';
      }

      return {
        ...client,
        health: {
          status: healthStatus,
          reason: healthReason,
          daysSinceLastAudit,
          score: client.overall_score || 0,
        },
      };
    });

    // Calculate summary stats
    const summary = {
      total: clientsWithHealth.length,
      healthy: clientsWithHealth.filter((c: any) => c.health.status === 'healthy').length,
      attention: clientsWithHealth.filter((c: any) => c.health.status === 'attention').length,
      atRisk: clientsWithHealth.filter((c: any) => c.health.status === 'at-risk').length,
      new: clientsWithHealth.filter((c: any) => c.health.status === 'new').length,
      totalMRR: clientsWithHealth.reduce((sum: number, c: any) => sum + (c.estimated_monthly_value || 0), 0),
      avgScore: clientsWithHealth.length > 0
        ? Math.round(clientsWithHealth.reduce((sum: number, c: any) => sum + (c.overall_score || 0), 0) / clientsWithHealth.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      clients: clientsWithHealth,
      summary,
    });
  } catch (error: any) {
    console.error('Client health error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get client health' },
      { status: 500 }
    );
  }
}
