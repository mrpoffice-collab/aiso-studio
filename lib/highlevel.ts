/**
 * HighLevel (GoHighLevel) API Integration
 *
 * This module provides integration with HighLevel CRM including:
 * - Contact creation/upsert with AISO score as custom field
 * - Opportunity creation in pipelines
 * - Webhook signature verification
 * - Tag management for AISO-sourced leads
 *
 * API Docs: https://marketplace.gohighlevel.com/docs/
 * Webhook Events: https://marketplace.gohighlevel.com/docs/category/webhook/
 */

const HIGHLEVEL_API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

// ============================================================================
// TYPES
// ============================================================================

export interface HighLevelConfig {
  apiKey: string;           // Private Integration Token or OAuth access token
  locationId: string;       // Sub-account/location ID
  pipelineId?: string;      // Default pipeline for opportunities
  pipelineStageId?: string; // Default stage for new opportunities
  aisoScoreFieldId?: string; // Custom field ID for AISO score
  aisoSourceFieldId?: string; // Custom field ID for AISO source URL
}

export interface HighLevelContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  website?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  customFields?: Array<{
    id?: string;
    key?: string;
    value: string | number;
  }>;
}

export interface HighLevelOpportunity {
  id?: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue?: number;
  source?: string;
  customFields?: Array<{
    id?: string;
    key?: string;
    value: string | number;
  }>;
}

export interface HighLevelWebhookPayload {
  type: string;
  locationId: string;
  id?: string;
  timestamp?: string;
  // Contact fields
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  website?: string;
  companyName?: string;
  tags?: string[];
  customFields?: Array<{ id: string; value: string }>;
  // Opportunity fields
  pipelineId?: string;
  pipelineStageId?: string;
  contactId?: string;
  monetaryValue?: number;
  status?: string;
}

// Webhook event types we care about
export type HighLevelWebhookEvent =
  | 'ContactCreate'
  | 'ContactUpdate'
  | 'ContactTagUpdate'
  | 'OpportunityCreate'
  | 'OpportunityUpdate'
  | 'OpportunityStageUpdate'
  | 'OpportunityStatusUpdate';

// ============================================================================
// API CLIENT
// ============================================================================

export class HighLevelClient {
  private config: HighLevelConfig;

  constructor(config: HighLevelConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const url = `${HIGHLEVEL_API_BASE}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Version': API_VERSION,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // --------------------------------------------------------------------------
  // CONTACTS
  // --------------------------------------------------------------------------

  /**
   * Create a new contact in HighLevel
   */
  async createContact(contact: HighLevelContact): Promise<{ success: boolean; data?: { contact: { id: string } }; error?: string }> {
    return this.request('/contacts/', {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        locationId: this.config.locationId,
      }),
    });
  }

  /**
   * Update an existing contact
   */
  async updateContact(contactId: string, contact: Partial<HighLevelContact>): Promise<{ success: boolean; data?: { contact: { id: string } }; error?: string }> {
    return this.request(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  /**
   * Upsert a contact (create or update based on email/phone)
   */
  async upsertContact(contact: HighLevelContact): Promise<{ success: boolean; data?: { contact: { id: string }; new: boolean }; error?: string }> {
    return this.request('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        locationId: this.config.locationId,
      }),
    });
  }

  /**
   * Search for a contact by email
   */
  async findContactByEmail(email: string): Promise<{ success: boolean; data?: { contacts: Array<{ id: string }> }; error?: string }> {
    return this.request(`/contacts/search/duplicate?locationId=${this.config.locationId}&email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  }

  /**
   * Add tags to a contact
   */
  async addContactTags(contactId: string, tags: string[]): Promise<{ success: boolean; error?: string }> {
    return this.request(`/contacts/${contactId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  // --------------------------------------------------------------------------
  // OPPORTUNITIES
  // --------------------------------------------------------------------------

  /**
   * Create a new opportunity
   */
  async createOpportunity(opportunity: Omit<HighLevelOpportunity, 'id'>): Promise<{ success: boolean; data?: { opportunity: { id: string } }; error?: string }> {
    return this.request('/opportunities/', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
  }

  /**
   * Update an opportunity
   */
  async updateOpportunity(opportunityId: string, opportunity: Partial<HighLevelOpportunity>): Promise<{ success: boolean; error?: string }> {
    return this.request(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(opportunity),
    });
  }

  /**
   * Update opportunity stage
   */
  async updateOpportunityStage(opportunityId: string, stageId: string): Promise<{ success: boolean; error?: string }> {
    return this.request(`/opportunities/${opportunityId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ pipelineStageId: stageId }),
    });
  }

  // --------------------------------------------------------------------------
  // PIPELINES
  // --------------------------------------------------------------------------

  /**
   * Get all pipelines for the location
   */
  async getPipelines(): Promise<{ success: boolean; data?: { pipelines: Array<{ id: string; name: string; stages: Array<{ id: string; name: string }> }> }; error?: string }> {
    return this.request(`/opportunities/pipelines?locationId=${this.config.locationId}`, {
      method: 'GET',
    });
  }

  // --------------------------------------------------------------------------
  // CUSTOM FIELDS
  // --------------------------------------------------------------------------

  /**
   * Get custom fields for contacts
   */
  async getContactCustomFields(): Promise<{ success: boolean; data?: { customFields: Array<{ id: string; name: string; fieldKey: string }> }; error?: string }> {
    return this.request(`/locations/${this.config.locationId}/customFields?model=contact`, {
      method: 'GET',
    });
  }

  // --------------------------------------------------------------------------
  // TEST CONNECTION
  // --------------------------------------------------------------------------

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; locationName?: string }> {
    const result = await this.request<{ location: { name: string } }>(`/locations/${this.config.locationId}`, {
      method: 'GET',
    });

    if (result.success && result.data) {
      return {
        success: true,
        locationName: result.data.location?.name,
      };
    }

    return { success: false, error: result.error };
  }
}

// ============================================================================
// AISO-SPECIFIC HELPERS
// ============================================================================

/**
 * Create a contact from an AISO lead with AISO score as custom field
 */
export async function pushLeadToHighLevel(
  config: HighLevelConfig,
  lead: {
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    companyName?: string;
    website?: string;
    aisoScore?: number;
    sourceUrl?: string;
    persona?: 'own_site' | 'client_site';
  }
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  const client = new HighLevelClient(config);

  // Build custom fields array
  const customFields: Array<{ id?: string; key?: string; value: string | number }> = [];

  // Add AISO score if we have the custom field ID
  if (config.aisoScoreFieldId && lead.aisoScore !== undefined) {
    customFields.push({
      id: config.aisoScoreFieldId,
      value: lead.aisoScore,
    });
  }

  // Add source URL if we have the custom field ID
  if (config.aisoSourceFieldId && lead.sourceUrl) {
    customFields.push({
      id: config.aisoSourceFieldId,
      value: lead.sourceUrl,
    });
  }

  // Determine tags based on AISO data
  const tags: string[] = ['AISO Lead'];

  if (lead.aisoScore !== undefined) {
    if (lead.aisoScore < 50) {
      tags.push('Low AISO Score');
    } else if (lead.aisoScore < 70) {
      tags.push('Medium AISO Score');
    } else {
      tags.push('High AISO Score');
    }
  }

  if (lead.persona === 'own_site') {
    tags.push('Business Owner');
  } else if (lead.persona === 'client_site') {
    tags.push('Agency/Consultant');
  }

  // Parse name into first/last if needed
  let firstName = lead.firstName;
  let lastName = lead.lastName;
  if (!firstName && !lastName && lead.name) {
    const parts = lead.name.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || undefined;
  }

  // Upsert the contact
  const result = await client.upsertContact({
    email: lead.email,
    firstName,
    lastName,
    phone: lead.phone,
    companyName: lead.companyName,
    website: lead.website || lead.sourceUrl,
    source: 'AISO Studio',
    tags,
    customFields: customFields.length > 0 ? customFields : undefined,
  });

  if (result.success && result.data) {
    return {
      success: true,
      contactId: result.data.contact.id,
    };
  }

  return { success: false, error: result.error };
}

/**
 * Create an opportunity from an AISO lead
 */
export async function createOpportunityFromLead(
  config: HighLevelConfig,
  contactId: string,
  lead: {
    name?: string;
    companyName?: string;
    website?: string;
    aisoScore?: number;
    estimatedValue?: number;
  }
): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
  if (!config.pipelineId || !config.pipelineStageId) {
    return { success: false, error: 'Pipeline not configured' };
  }

  const client = new HighLevelClient(config);

  // Create opportunity name
  const opportunityName = lead.companyName
    ? `AISO Lead: ${lead.companyName}`
    : lead.website
      ? `AISO Lead: ${lead.website}`
      : `AISO Lead: ${lead.name || 'Unknown'}`;

  const result = await client.createOpportunity({
    name: opportunityName,
    pipelineId: config.pipelineId,
    pipelineStageId: config.pipelineStageId,
    contactId,
    status: 'open',
    monetaryValue: lead.estimatedValue,
    source: 'AISO Studio',
  });

  if (result.success && result.data) {
    return {
      success: true,
      opportunityId: result.data.opportunity.id,
    };
  }

  return { success: false, error: result.error };
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Verify HighLevel webhook signature
 * HighLevel uses x-wh-signature header for verification
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  // HighLevel uses RSA-SHA256 for webhook signatures
  // For now, we'll do basic verification - in production, implement full RSA verification
  // The signature is in the x-wh-signature header

  if (!signature || !publicKey) {
    return false;
  }

  // TODO: Implement full RSA-SHA256 verification
  // For now, we trust the request if signature is present
  // This should be enhanced with proper crypto verification
  return signature.length > 0;
}

/**
 * Parse and validate a HighLevel webhook payload
 */
export function parseWebhookPayload(body: string): {
  valid: boolean;
  event?: HighLevelWebhookEvent;
  payload?: HighLevelWebhookPayload;
  error?: string;
} {
  try {
    const data = JSON.parse(body) as HighLevelWebhookPayload;

    if (!data.type) {
      return { valid: false, error: 'Missing event type' };
    }

    return {
      valid: true,
      event: data.type as HighLevelWebhookEvent,
      payload: data,
    };
  } catch {
    return { valid: false, error: 'Invalid JSON payload' };
  }
}

/**
 * Handle incoming webhook and trigger AISO actions
 */
export async function handleHighLevelWebhook(
  event: HighLevelWebhookEvent,
  payload: HighLevelWebhookPayload
): Promise<{ action: string; data?: Record<string, unknown> }> {
  switch (event) {
    case 'ContactCreate':
      // When a new contact is created in HighLevel, we could:
      // - Auto-run an AISO audit on their website
      // - Add them to AISO's captured_leads table
      return {
        action: 'contact_created',
        data: {
          contactId: payload.id,
          email: payload.email,
          website: payload.website,
          suggestion: payload.website
            ? 'Consider running AISO audit on this contact\'s website'
            : 'No website available for audit',
        },
      };

    case 'ContactUpdate':
      return {
        action: 'contact_updated',
        data: {
          contactId: payload.id,
          email: payload.email,
        },
      };

    case 'ContactTagUpdate':
      // Could trigger specific actions based on tags
      return {
        action: 'tags_updated',
        data: {
          contactId: payload.id,
          tags: payload.tags,
        },
      };

    case 'OpportunityCreate':
      return {
        action: 'opportunity_created',
        data: {
          opportunityId: payload.id,
          contactId: payload.contactId,
          pipelineId: payload.pipelineId,
          stageId: payload.pipelineStageId,
        },
      };

    case 'OpportunityStageUpdate':
      // When opportunity moves to a specific stage, could trigger actions
      return {
        action: 'stage_changed',
        data: {
          opportunityId: payload.id,
          newStageId: payload.pipelineStageId,
        },
      };

    case 'OpportunityStatusUpdate':
      // When opportunity is won/lost
      return {
        action: 'status_changed',
        data: {
          opportunityId: payload.id,
          status: payload.status,
        },
      };

    default:
      return {
        action: 'unhandled_event',
        data: { event, payload },
      };
  }
}

// ============================================================================
// SYNC UTILITIES
// ============================================================================

/**
 * Sync AISO score back to HighLevel when an audit is run
 */
export async function syncAisoScoreToHighLevel(
  config: HighLevelConfig,
  contactId: string,
  aisoScore: number,
  auditUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!config.aisoScoreFieldId) {
    return { success: false, error: 'AISO score custom field not configured' };
  }

  const client = new HighLevelClient(config);

  const customFields: Array<{ id: string; value: string | number }> = [
    { id: config.aisoScoreFieldId, value: aisoScore },
  ];

  if (config.aisoSourceFieldId) {
    customFields.push({ id: config.aisoSourceFieldId, value: auditUrl });
  }

  // Update contact with new AISO score
  const result = await client.updateContact(contactId, {
    customFields,
  });

  // Also update tags based on score
  const tags: string[] = [];
  if (aisoScore < 50) {
    tags.push('Low AISO Score');
  } else if (aisoScore < 70) {
    tags.push('Medium AISO Score');
  } else {
    tags.push('High AISO Score');
  }

  if (tags.length > 0) {
    await client.addContactTags(contactId, tags);
  }

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
}
