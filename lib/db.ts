import postgres from 'postgres';

// Create PostgreSQL connection for Neon - v2
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
  prepare: false, // Disable prepared statements to avoid caching issues after schema changes
});

// Export sql for migrations and direct queries
export { sql };

// Helper function to execute queries
export async function query<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const result = await sql.unsafe(queryText, params);
    return result as unknown as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Database helper functions for common operations
export const db = {
  // Users
  async getUserByClerkId(clerkId: string) {
    const result = await query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
    );
    return result[0] || null;
  },

  async getUserById(userId: string) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result[0] || null;
  },

  async createUser(data: { clerk_id: string; email: string; name?: string }) {
    const result = await query(
      `INSERT INTO users (
        clerk_id, email, name,
        subscription_tier, subscription_status,
        article_limit, articles_used_this_month,
        strategies_limit, strategies_used,
        seats_limit, seats_used,
        trial_ends_at
       )
       VALUES ($1, $2, $3, 'trial', 'trialing', 10, 0, 1, 0, 1, 1, CURRENT_TIMESTAMP + INTERVAL '7 days')
       RETURNING *`,
      [data.clerk_id, data.email, data.name || null]
    );
    return result[0];
  },

  async getUserByEmail(email: string) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result[0] || null;
  },

  // Strategies
  async getStrategiesByUserId(userId: number | string) {
    return await query(
      'SELECT * FROM strategies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async getStrategyById(id: string) {
    const result = await query(
      'SELECT * FROM strategies WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async createStrategy(data: any) {
    // Convert keywords string to array if needed
    const keywordsArray = data.keywords
      ? (typeof data.keywords === 'string'
          ? data.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : data.keywords)
      : [];

    const result = await sql`
      INSERT INTO strategies (
        user_id, client_name, industry, goals, target_audience,
        brand_voice, frequency, content_length, keywords, target_flesch_score,
        content_type, city, state, service_area, website_url
      ) VALUES (
        ${data.user_id},
        ${data.client_name},
        ${data.industry},
        ${sql.json(data.goals)},
        ${data.target_audience},
        ${data.brand_voice},
        ${data.frequency},
        ${data.content_length},
        ${sql.array(keywordsArray)},
        ${data.target_flesch_score || 55},
        ${data.content_type || 'national'},
        ${data.content_type === 'local' || data.content_type === 'hybrid' ? data.city : null},
        ${data.content_type === 'local' || data.content_type === 'hybrid' ? data.state : null},
        ${data.content_type === 'local' || data.content_type === 'hybrid' ? data.service_area : null},
        ${data.website_url || null}
      ) RETURNING *
    `;
    return result[0];
  },

  // Topics
  async getTopicsByStrategyId(strategyId: string) {
    return await query(
      'SELECT * FROM topics WHERE strategy_id = $1 ORDER BY position',
      [strategyId]
    );
  },

  async createTopic(data: any) {
    // Use postgres package's native JSONB support - pass array directly
    const result = await sql`
      INSERT INTO topics (
        strategy_id, title, keyword, outline, seo_intent, word_count, position,
        cluster_id, primary_link_url, primary_link_anchor, cta_type, link_placement_hint
      ) VALUES (
        ${data.strategy_id},
        ${data.title},
        ${data.keyword},
        ${sql.json(data.outline)},
        ${data.seo_intent},
        ${data.word_count},
        ${data.position},
        ${data.cluster_id || null},
        ${data.primary_link_url || null},
        ${data.primary_link_anchor || null},
        ${data.cta_type || null},
        ${data.link_placement_hint || null}
      ) RETURNING *
    `;
    return result[0];
  },

  // Posts
  async getPostsByUserId(userId: number | string) {
    return await query(
      'SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async getPostById(id: string) {
    const result = await query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async createPost(data: any) {
    const result = await query(
      `INSERT INTO posts (
        topic_id, user_id, title, meta_description, content,
        word_count, fact_checks, aeo_score, geo_score, aiso_score,
        actual_flesch_score, target_flesch_score, readability_gap, readability_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        data.topic_id,
        data.user_id,
        data.title,
        data.meta_description,
        data.content,
        data.word_count,
        JSON.stringify(data.fact_checks || []),
        data.aeo_score || null, // NEW - Answer Engine Optimization score
        data.geo_score || null, // NEW - Local Intent Optimization score
        data.aiso_score || null, // NEW - Overall AISO score with fact-checking
        data.actual_flesch_score || null, // NEW - Actual Flesch Reading Ease
        data.target_flesch_score || null, // NEW - Target from strategy
        data.readability_gap || null, // NEW - Gap between actual and target
        data.readability_score || null, // NEW - Intent-based readability score
      ]
    );
    return result[0];
  },

  async updatePost(id: string, data: any) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    console.log('🔧 updatePost called with:', {
      id,
      aiso_score: data.aiso_score,
      aeo_score: data.aeo_score,
      geo_score: data.geo_score,
      word_count: data.word_count,
    });

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(data.content);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.meta_description !== undefined) {
      updates.push(`meta_description = $${paramCount++}`);
      values.push(data.meta_description);
    }
    if (data.word_count !== undefined) {
      updates.push(`word_count = $${paramCount++}`);
      values.push(data.word_count);
    }
    if (data.aiso_score !== undefined) {
      updates.push(`aiso_score = $${paramCount++}`);
      values.push(data.aiso_score);
    }
    if (data.aeo_score !== undefined) {
      updates.push(`aeo_score = $${paramCount++}`);
      values.push(data.aeo_score);
    }
    if (data.geo_score !== undefined) {
      updates.push(`geo_score = $${paramCount++}`);
      values.push(data.geo_score);
    }
    if (data.fact_checks !== undefined) {
      updates.push(`fact_checks = $${paramCount++}`);
      values.push(JSON.stringify(data.fact_checks));
    }

    console.log('🔧 SQL Query:', `UPDATE posts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`);
    console.log('🔧 Values:', values);

    values.push(id);
    const result = await query(
      `UPDATE posts SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    console.log('✅ updatePost result:', {
      aiso_score: result[0]?.aiso_score,
      aeo_score: result[0]?.aeo_score,
      updated: result[0] ? 'SUCCESS' : 'FAILED'
    });

    return result[0];
  },

  // Fact Checks
  async getFactChecksByPostId(postId: string) {
    return await query(
      'SELECT * FROM fact_checks WHERE post_id = $1 ORDER BY created_at',
      [postId]
    );
  },

  async createFactCheck(data: {
    post_id: string;
    claim: string;
    status: string;
    confidence: number;
    sources: any[];
  }) {
    const result = await sql`
      INSERT INTO fact_checks (
        post_id, claim, status, confidence, sources
      ) VALUES (
        ${data.post_id},
        ${data.claim},
        ${data.status},
        ${data.confidence},
        ${sql.json(data.sources)}
      ) RETURNING *
    `;
    return result[0];
  },

  async deleteFactChecksByPostId(postId: string) {
    await query('DELETE FROM fact_checks WHERE post_id = $1', [postId]);
  },

  async getPostsByStrategyId(strategyId: string) {
    return await query(
      `SELECT p.*, t.title as topic_title, t.keyword
       FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE t.strategy_id = $1
       ORDER BY p.created_at DESC`,
      [strategyId]
    );
  },

  async getTopicById(id: string) {
    const result = await query(
      'SELECT * FROM topics WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async updateTopicStatus(id: string, status: string) {
    const result = await query(
      'UPDATE topics SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result[0];
  },

  async updateTopic(id: string, data: {
    title?: string;
    keyword?: string;
    outline?: any;
    target_flesch_score?: number | null;
  }) {
    // Build update query dynamically using postgres package
    const result = await sql`
      UPDATE topics
      SET
        ${data.title !== undefined ? sql`title = ${data.title},` : sql``}
        ${data.keyword !== undefined ? sql`keyword = ${data.keyword},` : sql``}
        ${data.outline !== undefined ? sql`outline = ${sql.json(data.outline)},` : sql``}
        ${data.target_flesch_score !== undefined ? sql`target_flesch_score = ${data.target_flesch_score},` : sql``}
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  // Usage logs
  async logUsage(data: {
    user_id: string;
    operation_type: string;
    cost_usd: number;
    tokens_used: number;
    metadata?: any;
  }) {
    await query(
      `INSERT INTO usage_logs (user_id, operation_type, cost_usd, tokens_used, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.user_id,
        data.operation_type,
        data.cost_usd,
        data.tokens_used,
        JSON.stringify(data.metadata || {}),
      ]
    );
  },

  async getUsageByUserId(userId: string, limit: number = 100) {
    return await query(
      'SELECT * FROM usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
  },

  // Strategy reset - deletes all topics and posts for a strategy
  async resetStrategy(strategyId: string): Promise<{
    deletedTopics: number;
    deletedPosts: number;
    deletedFactChecks: number;
    hasExistingPosts: boolean;
  }> {
    // IMPORTANT: Due to ON DELETE CASCADE on posts.topic_id, we CANNOT selectively delete topics
    // Deleting ANY topic will cascade delete its posts
    //
    // SAFE APPROACH: Only allow reset if there are NO posts at all
    // If user has generated posts, they must keep all topics

    // Check if any posts exist for this strategy
    const postsResult = await query(
      `SELECT COUNT(*) as count FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE t.strategy_id = $1`,
      [strategyId]
    );
    const postCount = parseInt(postsResult[0]?.count || '0');

    // If posts exist, do NOT delete anything
    if (postCount > 0) {
      return {
        deletedTopics: 0,
        deletedPosts: 0,
        deletedFactChecks: 0,
        hasExistingPosts: true
      };
    }

    // Safe to delete - no posts exist
    const topicsResult = await query(
      'SELECT COUNT(*) as count FROM topics WHERE strategy_id = $1',
      [strategyId]
    );
    const deletedTopics = parseInt(topicsResult[0]?.count || '0');

    await query('DELETE FROM topics WHERE strategy_id = $1', [strategyId]);

    return {
      deletedTopics,
      deletedPosts: 0,
      deletedFactChecks: 0,
      hasExistingPosts: false
    };
  },

  // Existing content management
  async getExistingContentByStrategyId(strategyId: string) {
    return await query(
      'SELECT * FROM existing_content WHERE strategy_id = $1 ORDER BY created_at DESC',
      [strategyId]
    );
  },

  async addExistingContent(data: {
    strategy_id: string;
    url: string;
    title: string;
    content_excerpt: string;
  }) {
    const result = await query(
      `INSERT INTO existing_content (strategy_id, url, title, content_excerpt)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.strategy_id, data.url, data.title, data.content_excerpt]
    );
    return result[0];
  },

  async deleteExistingContent(id: string) {
    await query('DELETE FROM existing_content WHERE id = $1', [id]);
  },

  async updatePostSimilarityCheck(
    postId: string,
    data: {
      similarity_checked: boolean;
      similarity_score?: number;
      duplicate_warnings?: any[];
    }
  ) {
    const result = await query(
      `UPDATE posts
       SET similarity_checked = $1,
           similarity_score = $2,
           duplicate_warnings = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        data.similarity_checked,
        data.similarity_score || null,
        JSON.stringify(data.duplicate_warnings || []),
        postId,
      ]
    );
    return result[0];
  },

  async updateStrategyExistingUrls(strategyId: string, urls: string[]) {
    const result = await sql`
      UPDATE strategies
      SET existing_blog_urls = ${sql.json(urls)}, updated_at = NOW()
      WHERE id = ${strategyId}
      RETURNING *
    `;
    return result[0];
  },

  // Lead Pipeline - Projects
  async createLeadProject(data: {
    user_id: number;
    name: string;
    industry?: string;
    location?: string;
  }) {
    const result = await query(
      `INSERT INTO lead_projects (user_id, name, industry, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.name, data.industry || null, data.location || null]
    );
    return result[0];
  },

  async getLeadProjectsByUserId(userId: number | string) {
    return await query(
      'SELECT * FROM lead_projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async getLeadProjectById(id: number) {
    const result = await query(
      'SELECT * FROM lead_projects WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async updateLeadProject(id: number, data: {
    name?: string;
    industry?: string;
    location?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.industry !== undefined) {
      updates.push(`industry = $${paramCount++}`);
      values.push(data.industry);
    }
    if (data.location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(data.location);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE lead_projects SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0];
  },

  async deleteLeadProject(id: number) {
    await query('DELETE FROM lead_projects WHERE id = $1', [id]);
  },

  // Lead Pipeline - Leads
  async createLead(data: {
    user_id: string; // UUID
    project_id?: number;
    domain: string;
    business_name: string;
    city?: string;
    state?: string;
    industry?: string;
    overall_score: number;
    content_score: number;
    seo_score: number;
    design_score: number;
    speed_score: number;
    has_blog?: boolean;
    blog_post_count?: number;
    last_blog_update?: string;
    phone?: string;
    address?: string;
    email?: string;
    status?: string;
    opportunity_rating?: string;
    discovery_data?: any;
    // AISO-specific fields
    aiso_opportunity_score?: number;
    estimated_monthly_value?: number;
    primary_pain_point?: string;
    secondary_pain_points?: string[];
    recommended_pitch?: string;
    time_to_close?: string;
    // Accessibility/WCAG fields
    accessibility_score?: number;
    wcag_critical_violations?: number;
    wcag_serious_violations?: number;
    wcag_moderate_violations?: number;
    wcag_minor_violations?: number;
    wcag_total_violations?: number;
    // Searchability fields
    ranking_keywords?: number;
    avg_search_position?: number;
    estimated_organic_traffic?: number;
  }) {
    try {
      const result = await query(
        `INSERT INTO leads (
          user_id, project_id, domain, business_name, city, state, industry,
          overall_score, content_score, seo_score, design_score, speed_score,
          has_blog, blog_post_count, last_blog_update, phone, address, email,
          status, opportunity_rating, discovery_data,
          aiso_opportunity_score, estimated_monthly_value, primary_pain_point,
          secondary_pain_points, recommended_pitch, time_to_close,
          accessibility_score, wcag_critical_violations, wcag_serious_violations,
          wcag_moderate_violations, wcag_minor_violations, wcag_total_violations,
          ranking_keywords, avg_search_position, estimated_organic_traffic
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
        RETURNING *`,
        [
          data.user_id,
          data.project_id || null,
          data.domain,
          data.business_name,
          data.city || null,
          data.state || null,
          data.industry || null,
          data.overall_score,
          data.content_score,
          data.seo_score,
          data.design_score,
          data.speed_score,
          data.has_blog || false,
          data.blog_post_count || 0,
          data.last_blog_update || null,
          data.phone || null,
          data.address || null,
          data.email || null,
          data.status || 'new',
          data.opportunity_rating || null,
          data.discovery_data ? JSON.stringify(data.discovery_data) : null,
          // AISO fields
          data.aiso_opportunity_score || 0,
          data.estimated_monthly_value || 299,
          data.primary_pain_point || null,
          data.secondary_pain_points || null,
          data.recommended_pitch || null,
          data.time_to_close || 'medium',
          // Accessibility fields
          data.accessibility_score || null,
          data.wcag_critical_violations || 0,
          data.wcag_serious_violations || 0,
          data.wcag_moderate_violations || 0,
          data.wcag_minor_violations || 0,
          data.wcag_total_violations || 0,
          // Searchability fields
          data.ranking_keywords || null,
          data.avg_search_position || null,
          data.estimated_organic_traffic || null,
        ]
      );
      return result[0];
    } catch (error: any) {
      // If duplicate, return existing
      if (error.code === '23505') {
        const existing = await query(
          'SELECT * FROM leads WHERE user_id = $1 AND domain = $2',
          [data.user_id, data.domain]
        );
        return existing[0];
      }
      throw error;
    }
  },

  async getLeadsByUserId(userId: number | string, filters?: {
    project_id?: number;
    status?: string;
    min_score?: number;
    max_score?: number;
  }) {
    let queryText = 'SELECT * FROM leads WHERE user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;

    if (filters?.project_id) {
      queryText += ` AND project_id = $${paramCount++}`;
      params.push(filters.project_id);
    }
    if (filters?.status) {
      queryText += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }
    if (filters?.min_score !== undefined) {
      queryText += ` AND overall_score >= $${paramCount++}`;
      params.push(filters.min_score);
    }
    if (filters?.max_score !== undefined) {
      queryText += ` AND overall_score <= $${paramCount++}`;
      params.push(filters.max_score);
    }

    queryText += ' ORDER BY discovered_at DESC';

    return await query(queryText, params);
  },

  async getLeadById(id: number) {
    const result = await query(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async updateLead(id: number, data: {
    project_id?: number;
    status?: string;
    opportunity_rating?: string;
    report_generated_at?: Date;
    contacted_at?: Date;
    notes?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.project_id !== undefined) {
      updates.push(`project_id = $${paramCount++}`);
      values.push(data.project_id);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.opportunity_rating !== undefined) {
      updates.push(`opportunity_rating = $${paramCount++}`);
      values.push(data.opportunity_rating);
    }
    if (data.report_generated_at !== undefined) {
      updates.push(`report_generated_at = $${paramCount++}`);
      values.push(data.report_generated_at);
    }
    if (data.contacted_at !== undefined) {
      updates.push(`contacted_at = $${paramCount++}`);
      values.push(data.contacted_at);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0];
  },

  async deleteLead(id: number) {
    await query('DELETE FROM leads WHERE id = $1', [id]);
  },

  // Lead Pipeline - Activities
  async createLeadActivity(data: {
    lead_id: number;
    user_id: number;
    activity_type: string;
    description?: string;
  }) {
    const result = await query(
      `INSERT INTO lead_activities (lead_id, user_id, activity_type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.lead_id, data.user_id, data.activity_type, data.description || null]
    );
    return result[0];
  },

  async getLeadActivitiesByLeadId(leadId: number) {
    return await query(
      'SELECT * FROM lead_activities WHERE lead_id = $1 ORDER BY created_at DESC',
      [leadId]
    );
  },

  async getLeadActivitiesByUserId(userId: number | string, limit: number = 50) {
    return await query(
      'SELECT * FROM lead_activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
  },

  // Batch Lead Discovery
  async createBatchDiscovery(data: {
    user_id: string;
    industry: string;
    city: string;
    state?: string;
    target_count: number;
    filter_range?: string;
  }) {
    const result = await sql`
      INSERT INTO batch_lead_discovery (user_id, industry, city, state, target_count, filter_range, status)
      VALUES (${data.user_id}, ${data.industry}, ${data.city}, ${data.state || null}, ${data.target_count}, ${data.filter_range || 'sweet-spot'}, 'queued')
      RETURNING *
    `;
    return result[0];
  },

  async getBatchDiscoveryById(id: string) {
    const result = await sql`
      SELECT * FROM batch_lead_discovery WHERE id = ${id}
    `;
    return result[0] || null;
  },

  async getBatchDiscoveriesByUserId(userId: string, limit: number = 20) {
    const result = await sql`
      SELECT * FROM batch_lead_discovery
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result;
  },

  async updateBatchDiscovery(id: string, data: {
    status?: string;
    progress?: number;
    businesses_searched?: number;
    sweet_spot_found?: number;
    total_leads_saved?: number;
    error_message?: string;
    started_at?: Date;
    completed_at?: Date;
  }) {
    const updates: any = { updated_at: new Date() };

    if (data.status !== undefined) updates.status = data.status;
    if (data.progress !== undefined) updates.progress = data.progress;
    if (data.businesses_searched !== undefined) updates.businesses_searched = data.businesses_searched;
    if (data.sweet_spot_found !== undefined) updates.sweet_spot_found = data.sweet_spot_found;
    if (data.total_leads_saved !== undefined) updates.total_leads_saved = data.total_leads_saved;
    if (data.error_message !== undefined) updates.error_message = data.error_message;
    if (data.started_at !== undefined) updates.started_at = data.started_at;
    if (data.completed_at !== undefined) updates.completed_at = data.completed_at;

    const result = await sql`
      UPDATE batch_lead_discovery
      SET ${sql(updates)}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  },

  async cancelBatchDiscovery(id: string) {
    const result = await sql`
      UPDATE batch_lead_discovery
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = ${id} AND status IN ('queued', 'processing')
      RETURNING *
    `;
    return result[0];
  },

  // Money Pages (Strategic Linking)
  async getMoneyPagesByStrategyId(strategyId: string) {
    const result = await sql`
      SELECT * FROM money_pages
      WHERE strategy_id = ${strategyId}
      ORDER BY priority ASC, created_at DESC
    `;
    return result;
  },

  async getMoneyPageById(id: string) {
    const result = await sql`
      SELECT * FROM money_pages WHERE id = ${id}
    `;
    return result[0] || null;
  },

  async createMoneyPage(data: {
    strategy_id: string;
    url: string;
    title: string;
    page_type: string;
    description?: string;
    priority?: number;
    target_keywords?: string[];
  }) {
    const result = await sql`
      INSERT INTO money_pages (
        strategy_id, url, title, page_type, description, priority, target_keywords
      ) VALUES (
        ${data.strategy_id},
        ${data.url},
        ${data.title},
        ${data.page_type},
        ${data.description || null},
        ${data.priority || 2},
        ${data.target_keywords ? sql.array(data.target_keywords) : sql.array([])}
      ) RETURNING *
    `;
    return result[0];
  },

  async updateMoneyPage(id: string, data: Partial<{
    url: string;
    title: string;
    page_type: string;
    description: string;
    priority: number;
    target_keywords: string[];
  }>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      values.push(data.url);
    }
    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.page_type !== undefined) {
      updates.push(`page_type = $${paramIndex++}`);
      values.push(data.page_type);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }
    if (data.target_keywords !== undefined) {
      updates.push(`target_keywords = $${paramIndex++}`);
      values.push(data.target_keywords);
    }

    if (updates.length === 0) {
      const existing = await this.getMoneyPageById(id);
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE money_pages SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  async deleteMoneyPage(id: string) {
    const result = await sql`
      DELETE FROM money_pages WHERE id = ${id} RETURNING *
    `;
    return result[0] || null;
  },

  // Topic Clusters
  async getTopicClustersByStrategyId(strategyId: string) {
    const result = await sql`
      SELECT
        tc.*,
        mp.url as primary_money_page_url,
        mp.title as primary_money_page_title,
        mp.page_type as primary_money_page_type,
        COUNT(t.id) as topic_count
      FROM topic_clusters tc
      LEFT JOIN money_pages mp ON tc.primary_money_page_id = mp.id
      LEFT JOIN topics t ON t.cluster_id = tc.id
      WHERE tc.strategy_id = ${strategyId}
      GROUP BY tc.id, mp.id
      ORDER BY tc.created_at DESC
    `;
    return result;
  },

  async getTopicClusterById(id: string) {
    const result = await sql`
      SELECT
        tc.*,
        mp.url as primary_money_page_url,
        mp.title as primary_money_page_title
      FROM topic_clusters tc
      LEFT JOIN money_pages mp ON tc.primary_money_page_id = mp.id
      WHERE tc.id = ${id}
    `;
    return result[0] || null;
  },

  async createTopicCluster(data: {
    strategy_id: string;
    name: string;
    description?: string;
    primary_money_page_id?: string;
    secondary_money_page_ids?: string[];
    funnel_stage?: string;
  }) {
    const result = await sql`
      INSERT INTO topic_clusters (
        strategy_id, name, description, primary_money_page_id, secondary_money_page_ids, funnel_stage
      ) VALUES (
        ${data.strategy_id},
        ${data.name},
        ${data.description || null},
        ${data.primary_money_page_id || null},
        ${data.secondary_money_page_ids ? sql.array(data.secondary_money_page_ids) : sql.array([])},
        ${data.funnel_stage || null}
      ) RETURNING *
    `;
    return result[0];
  },

  async updateTopicCluster(id: string, data: Partial<{
    name: string;
    description: string;
    primary_money_page_id: string;
    secondary_money_page_ids: string[];
    funnel_stage: string;
  }>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.primary_money_page_id !== undefined) {
      updates.push(`primary_money_page_id = $${paramIndex++}`);
      values.push(data.primary_money_page_id);
    }
    if (data.secondary_money_page_ids !== undefined) {
      updates.push(`secondary_money_page_ids = $${paramIndex++}`);
      values.push(data.secondary_money_page_ids);
    }
    if (data.funnel_stage !== undefined) {
      updates.push(`funnel_stage = $${paramIndex++}`);
      values.push(data.funnel_stage);
    }

    if (updates.length === 0) {
      const existing = await this.getTopicClusterById(id);
      return existing;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE topic_clusters SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  async deleteTopicCluster(id: string) {
    const result = await sql`
      DELETE FROM topic_clusters WHERE id = ${id} RETURNING *
    `;
    return result[0] || null;
  },

  // Content Audits
  async createContentAudit(data: {
    user_id: number;
    url: string;
    title?: string;
    original_content: string;
    original_score: number;
    original_breakdown?: any;
    improved_content?: string;
    improved_score?: number;
    improved_breakdown?: any;
    iterations?: number;
    cost_usd?: number;
  }) {
    const result = await query(
      `INSERT INTO content_audits (
        user_id, url, title, original_content, original_score, original_breakdown,
        improved_content, improved_score, improved_breakdown, iterations, cost_usd
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.user_id,
        data.url,
        data.title || null,
        data.original_content,
        data.original_score,
        data.original_breakdown ? JSON.stringify(data.original_breakdown) : null,
        data.improved_content || null,
        data.improved_score || null,
        data.improved_breakdown ? JSON.stringify(data.improved_breakdown) : null,
        data.iterations || 0,
        data.cost_usd || 0,
      ]
    );
    return result[0];
  },

  async getContentAuditsByUserId(userId: number | string, limit = 50) {
    return await query(
      `SELECT * FROM content_audits
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  },

  async getContentAuditById(id: number) {
    const result = await query(
      'SELECT * FROM content_audits WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async deleteContentAudit(id: number) {
    const result = await query(
      'DELETE FROM content_audits WHERE id = $1 RETURNING *',
      [id]
    );
    return result[0] || null;
  },

  // Subscription Management
  async getAllUsersWithSubscriptions() {
    return await query(
      `SELECT
        id, clerk_id, email, name,
        subscription_tier, subscription_status,
        trial_ends_at, article_limit, articles_used_this_month,
        strategies_limit, strategies_used,
        created_at
       FROM users
       ORDER BY created_at DESC`
    );
  },

  async updateUserSubscription(data: {
    userId: string;
    tier: string;
    status: string;
    articleLimit: number;
    manualOverride?: boolean;
    overrideReason?: string;
    overrideBy?: string;
  }) {
    const strategiesLimit = data.tier === 'agency' || data.tier === 'enterprise' ? 999 :
                           data.tier === 'professional' ? 10 :
                           data.tier === 'starter' ? 3 : 1;

    const seatsLimit = data.tier === 'enterprise' ? 10 :
                      data.tier === 'agency' ? 3 : 1;

    const result = await query(
      `UPDATE users
       SET subscription_tier = $1,
           subscription_status = $2,
           article_limit = $3,
           strategies_limit = $4,
           seats_limit = $5,
           manual_override = $6,
           override_reason = $7,
           override_by = $8,
           subscription_started_at = CURRENT_TIMESTAMP,
           billing_cycle_start = CURRENT_TIMESTAMP,
           billing_cycle_end = CURRENT_TIMESTAMP + INTERVAL '1 month',
           trial_ends_at = NULL
       WHERE id = $9
       RETURNING *`,
      [
        data.tier,
        data.status,
        data.articleLimit,
        strategiesLimit,
        seatsLimit,
        data.manualOverride || false,
        data.overrideReason || null,
        data.overrideBy || null,
        data.userId
      ]
    );
    return result[0];
  },

  async getUserSubscriptionInfo(userId: number | string) {
    const result = await query(
      `SELECT
        subscription_tier, subscription_status,
        article_limit, articles_used_this_month,
        strategies_limit, strategies_used,
        trial_ends_at, billing_cycle_end
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = result[0];

    // If user exists but subscription fields are null, initialize them
    if (user && !user.subscription_tier) {
      await query(
        `UPDATE users
         SET subscription_tier = 'trial',
             subscription_status = 'trialing',
             article_limit = 10,
             articles_used_this_month = 0,
             strategies_limit = 1,
             strategies_used = 0,
             seats_limit = 1,
             seats_used = 1,
             trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
         WHERE id = $1`,
        [userId]
      );

      // Return initialized values
      return {
        subscription_tier: 'trial',
        subscription_status: 'trialing',
        article_limit: 10,
        articles_used_this_month: 0,
        strategies_limit: 1,
        strategies_used: 0,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        billing_cycle_end: null
      };
    }

    return user || null;
  },

  async incrementArticleUsage(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET articles_used_this_month = articles_used_this_month + 1
       WHERE id = $1
       RETURNING articles_used_this_month, article_limit`,
      [userId]
    );
    return result[0];
  },

  async incrementAuditUsage(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET audits_used_this_month = COALESCE(audits_used_this_month, 0) + 1
       WHERE id = $1
       RETURNING audits_used_this_month, audit_limit`,
      [userId]
    );
    return result[0];
  },

  async checkAuditLimit(userId: number | string) {
    const result = await query(
      `SELECT audits_used_this_month, audit_limit, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const used = user.audits_used_this_month || 0;
    const limit = user.audit_limit || 10;
    // Enterprise tier has unlimited audits
    const isUnlimited = user.subscription_tier === 'enterprise';

    return {
      allowed: isUnlimited || used < limit,
      used,
      limit,
      isUnlimited,
    };
  },

  async resetMonthlyUsage(userId: number | string) {
    await query(
      `UPDATE users
       SET articles_used_this_month = 0,
           audits_used_this_month = 0,
           rewrites_used_this_month = 0,
           repurposes_used_this_month = 0,
           billing_cycle_start = CURRENT_TIMESTAMP,
           billing_cycle_end = CURRENT_TIMESTAMP + INTERVAL '1 month'
       WHERE id = $1`,
      [userId]
    );
  },

  // Strategy limit check
  async checkStrategyLimit(userId: number | string) {
    const result = await query(
      `SELECT strategies_used, strategies_limit, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const used = user.strategies_used || 0;
    const limit = user.strategies_limit || 1;
    const isUnlimited = ['agency', 'enterprise'].includes(user.subscription_tier);

    return { allowed: isUnlimited || used < limit, used, limit, isUnlimited };
  },

  async incrementStrategyUsage(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET strategies_used = COALESCE(strategies_used, 0) + 1
       WHERE id = $1
       RETURNING strategies_used, strategies_limit`,
      [userId]
    );
    return result[0];
  },

  // Rewrite limit check
  async checkRewriteLimit(userId: number | string) {
    const result = await query(
      `SELECT rewrites_used_this_month, rewrites_limit, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const used = user.rewrites_used_this_month || 0;
    const limit = user.rewrites_limit || 5;
    const isUnlimited = ['professional', 'agency', 'enterprise'].includes(user.subscription_tier);

    return { allowed: isUnlimited || used < limit, used, limit, isUnlimited };
  },

  async incrementRewriteUsage(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET rewrites_used_this_month = COALESCE(rewrites_used_this_month, 0) + 1
       WHERE id = $1
       RETURNING rewrites_used_this_month, rewrites_limit`,
      [userId]
    );
    return result[0];
  },

  // Repurpose limit check
  async checkRepurposeLimit(userId: number | string) {
    const result = await query(
      `SELECT repurposes_used_this_month, repurposes_limit, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const used = user.repurposes_used_this_month || 0;
    const limit = user.repurposes_limit || 1;
    const isUnlimited = ['professional', 'agency', 'enterprise'].includes(user.subscription_tier);

    return { allowed: isUnlimited || used < limit, used, limit, isUnlimited };
  },

  async incrementRepurposeUsage(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET repurposes_used_this_month = COALESCE(repurposes_used_this_month, 0) + 1
       WHERE id = $1
       RETURNING repurposes_used_this_month, repurposes_limit`,
      [userId]
    );
    return result[0];
  },

  // Active Client Limits
  async checkActiveClientLimit(userId: number | string) {
    const result = await query(
      `SELECT active_clients_used, active_clients_limit, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const used = user.active_clients_used || 0;
    const limit = user.active_clients_limit || 1;
    // Agency tier has unlimited clients (9999)
    const isUnlimited = user.subscription_tier === 'agency' || limit >= 9999;

    return { allowed: isUnlimited || used < limit, used, limit, isUnlimited };
  },

  async incrementActiveClients(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET active_clients_used = COALESCE(active_clients_used, 0) + 1
       WHERE id = $1
       RETURNING active_clients_used, active_clients_limit`,
      [userId]
    );
    return result[0];
  },

  async decrementActiveClients(userId: number | string) {
    const result = await query(
      `UPDATE users
       SET active_clients_used = GREATEST(COALESCE(active_clients_used, 0) - 1, 0)
       WHERE id = $1
       RETURNING active_clients_used, active_clients_limit`,
      [userId]
    );
    return result[0];
  },

  // Vault Storage Limits
  async checkVaultStorageLimit(userId: number | string) {
    const result = await query(
      `SELECT vault_storage_used_mb, vault_storage_limit_mb, subscription_tier
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { allowed: false, usedMB: 0, limitMB: 0, percentUsed: 0 };

    const usedMB = user.vault_storage_used_mb || 0;
    const limitMB = user.vault_storage_limit_mb || 5120;
    const percentUsed = Math.round((usedMB / limitMB) * 100);

    return {
      allowed: usedMB < limitMB,
      usedMB,
      limitMB,
      percentUsed,
      usedFormatted: usedMB >= 1024 ? `${(usedMB / 1024).toFixed(1)} GB` : `${usedMB} MB`,
      limitFormatted: limitMB >= 1024 ? `${(limitMB / 1024).toFixed(0)} GB` : `${limitMB} MB`,
    };
  },

  async updateVaultStorageUsed(userId: number | string, deltaBytes: number) {
    // Convert bytes to MB (positive = add, negative = remove)
    const deltaMB = Math.ceil(deltaBytes / (1024 * 1024));
    const result = await query(
      `UPDATE users
       SET vault_storage_used_mb = GREATEST(COALESCE(vault_storage_used_mb, 0) + $2, 0)
       WHERE id = $1
       RETURNING vault_storage_used_mb, vault_storage_limit_mb`,
      [userId, deltaMB]
    );
    return result[0];
  },

  // Data Retention
  async getDataRetentionDays(userId: number | string) {
    const result = await query(
      `SELECT data_retention_days, subscription_tier FROM users WHERE id = $1`,
      [userId]
    );
    const user = result[0];
    if (!user) return { days: 90, isUnlimited: false };

    // NULL means unlimited (agency tier)
    const isUnlimited = user.data_retention_days === null || user.subscription_tier === 'agency';
    return {
      days: user.data_retention_days || 90,
      isUnlimited,
    };
  },

  // Agency Branding
  async getUserBranding(userId: number | string) {
    const result = await query(
      `SELECT
        agency_name, agency_logo_url, agency_primary_color, agency_secondary_color,
        agency_email, agency_phone, agency_website, agency_address, agency_tagline,
        signature_name, signature_title, signature_phone
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result[0] || null;
  },

  async updateUserBranding(userId: number | string, branding: {
    agency_name?: string;
    agency_logo_url?: string;
    agency_primary_color?: string;
    agency_secondary_color?: string;
    agency_email?: string;
    agency_phone?: string;
    agency_website?: string;
    agency_address?: string;
    agency_tagline?: string;
    signature_name?: string;
    signature_title?: string;
    signature_phone?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (branding.agency_name !== undefined) {
      updates.push(`agency_name = $${paramCount++}`);
      values.push(branding.agency_name);
    }
    if (branding.agency_logo_url !== undefined) {
      updates.push(`agency_logo_url = $${paramCount++}`);
      values.push(branding.agency_logo_url);
    }
    if (branding.agency_primary_color !== undefined) {
      updates.push(`agency_primary_color = $${paramCount++}`);
      values.push(branding.agency_primary_color);
    }
    if (branding.agency_secondary_color !== undefined) {
      updates.push(`agency_secondary_color = $${paramCount++}`);
      values.push(branding.agency_secondary_color);
    }
    if (branding.agency_email !== undefined) {
      updates.push(`agency_email = $${paramCount++}`);
      values.push(branding.agency_email);
    }
    if (branding.agency_phone !== undefined) {
      updates.push(`agency_phone = $${paramCount++}`);
      values.push(branding.agency_phone);
    }
    if (branding.agency_website !== undefined) {
      updates.push(`agency_website = $${paramCount++}`);
      values.push(branding.agency_website);
    }
    if (branding.agency_address !== undefined) {
      updates.push(`agency_address = $${paramCount++}`);
      values.push(branding.agency_address);
    }
    if (branding.agency_tagline !== undefined) {
      updates.push(`agency_tagline = $${paramCount++}`);
      values.push(branding.agency_tagline);
    }
    if (branding.signature_name !== undefined) {
      updates.push(`signature_name = $${paramCount++}`);
      values.push(branding.signature_name);
    }
    if (branding.signature_title !== undefined) {
      updates.push(`signature_title = $${paramCount++}`);
      values.push(branding.signature_title);
    }
    if (branding.signature_phone !== undefined) {
      updates.push(`signature_phone = $${paramCount++}`);
      values.push(branding.signature_phone);
    }

    if (updates.length === 0) {
      return await this.getUserBranding(userId);
    }

    values.push(userId);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING agency_name, agency_logo_url, agency_primary_color, agency_secondary_color,
                 agency_email, agency_phone, agency_website, agency_address, agency_tagline,
                 signature_name, signature_title, signature_phone`,
      values
    );
    return result[0];
  },

  // Accessibility Audits (WCAG) - Extended with content scores
  async createAccessibilityAudit(data: {
    user_id: number | string;
    content_audit_id?: number;
    url: string;
    accessibility_score: number;
    critical_count: number;
    serious_count: number;
    moderate_count: number;
    minor_count: number;
    total_violations: number;
    total_passes: number;
    violations: any[];
    passes: any[];
    wcag_breakdown: any;
    scan_version?: string;
    page_title?: string;
    page_language?: string;
    // Extended content score fields
    aiso_score?: number;
    aeo_score?: number;
    seo_score?: number;
    readability_score?: number;
    engagement_score?: number;
    fact_check_score?: number;
    seo_details?: any;
    readability_details?: any;
    engagement_details?: any;
    aeo_details?: any;
    fact_checks?: any[];
  }) {
    const result = await query(
      `INSERT INTO accessibility_audits (
        user_id, content_audit_id, url, accessibility_score,
        critical_count, serious_count, moderate_count, minor_count,
        total_violations, total_passes, violations, passes, wcag_breakdown,
        scan_version, page_title, page_language,
        aiso_score, aeo_score, seo_score, readability_score, engagement_score, fact_check_score,
        seo_details, readability_details, engagement_details, aeo_details, fact_checks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      RETURNING *`,
      [
        data.user_id,
        data.content_audit_id || null,
        data.url,
        data.accessibility_score,
        data.critical_count,
        data.serious_count,
        data.moderate_count,
        data.minor_count,
        data.total_violations,
        data.total_passes,
        JSON.stringify(data.violations),
        JSON.stringify(data.passes),
        JSON.stringify(data.wcag_breakdown),
        data.scan_version || null,
        data.page_title || null,
        data.page_language || null,
        data.aiso_score || 0,
        data.aeo_score || 0,
        data.seo_score || 0,
        data.readability_score || 0,
        data.engagement_score || 0,
        data.fact_check_score || 0,
        JSON.stringify(data.seo_details || {}),
        JSON.stringify(data.readability_details || {}),
        JSON.stringify(data.engagement_details || {}),
        JSON.stringify(data.aeo_details || {}),
        JSON.stringify(data.fact_checks || []),
      ]
    );
    return result[0];
  },

  async getAccessibilityAuditsByUserId(userId: number | string, limit = 50) {
    return await query(
      `SELECT * FROM accessibility_audits
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  },

  async getAccessibilityAuditById(id: number) {
    const result = await query(
      'SELECT * FROM accessibility_audits WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async getAccessibilityAuditByContentAuditId(contentAuditId: number) {
    const result = await query(
      'SELECT * FROM accessibility_audits WHERE content_audit_id = $1',
      [contentAuditId]
    );
    return result[0] || null;
  },

  async updateAccessibilityAuditRemediation(id: number, data: {
    ai_suggestions: any[];
    remediation_applied?: boolean;
  }) {
    const result = await query(
      `UPDATE accessibility_audits
       SET ai_suggestions = $1,
           remediation_applied = $2,
           remediation_at = CASE WHEN $2 THEN NOW() ELSE remediation_at END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(data.ai_suggestions), data.remediation_applied || false, id]
    );
    return result[0];
  },

  async deleteAccessibilityAudit(id: number) {
    const result = await query(
      'DELETE FROM accessibility_audits WHERE id = $1 RETURNING *',
      [id]
    );
    return result[0] || null;
  },

  // Digital Asset Manager
  async createAsset(data: {
    user_id: string;
    folder_id?: string;
    filename: string;
    original_filename: string;
    file_type: 'image' | 'pdf' | 'video' | 'document';
    mime_type: string;
    file_size: number;
    blob_url: string;
    public_url?: string;
    width?: number;
    height?: number;
    dominant_color?: string;
    tags?: string[];
    description?: string;
    alt_text?: string;
  }) {
    const result = await sql`
      INSERT INTO assets (
        user_id, folder_id, filename, original_filename, file_type, mime_type,
        file_size, blob_url, public_url, width, height, dominant_color,
        tags, description, alt_text
      ) VALUES (
        ${data.user_id},
        ${data.folder_id || null},
        ${data.filename},
        ${data.original_filename},
        ${data.file_type},
        ${data.mime_type},
        ${data.file_size},
        ${data.blob_url},
        ${data.public_url || null},
        ${data.width || null},
        ${data.height || null},
        ${data.dominant_color || null},
        ${data.tags ? sql.array(data.tags) : sql.array([])},
        ${data.description || null},
        ${data.alt_text || null}
      ) RETURNING *
    `;
    return result[0];
  },

  async getAssetsByUserId(userId: string, folderId?: string) {
    if (folderId) {
      const result = await sql`
        SELECT * FROM assets
        WHERE user_id = ${userId} AND folder_id = ${folderId} AND deleted_at IS NULL
        ORDER BY created_at DESC
      `;
      return result;
    }
    const result = await sql`
      SELECT * FROM assets
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    return result;
  },

  async getAssetById(id: string) {
    const result = await sql`
      SELECT * FROM assets WHERE id = ${id} AND deleted_at IS NULL
    `;
    return result[0] || null;
  },

  async updateAsset(id: string, data: {
    folder_id?: string | null;
    tags?: string[];
    description?: string;
    alt_text?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.folder_id !== undefined) {
      updates.push(`folder_id = $${paramIndex++}`);
      values.push(data.folder_id || null);
    }
    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(data.tags || []);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description || null);
    }
    if (data.alt_text !== undefined) {
      updates.push(`alt_text = $${paramIndex++}`);
      values.push(data.alt_text || null);
    }

    if (updates.length === 0) {
      // No updates provided, return current asset
      return this.getAssetById(id);
    }

    updates.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE assets SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      [...values, id]
    );
    return result[0];
  },

  async deleteAsset(id: string) {
    // Soft delete
    const result = await sql`
      UPDATE assets SET deleted_at = NOW() WHERE id = ${id} RETURNING *
    `;
    return result[0] || null;
  },

  async createAssetFolder(data: {
    user_id: string;
    name: string;
    parent_folder_id?: string;
    description?: string;
    color?: string;
    strategy_id?: string;
  }) {
    const result = await sql`
      INSERT INTO asset_folders (
        user_id, name, parent_folder_id, description, color, strategy_id
      ) VALUES (
        ${data.user_id},
        ${data.name},
        ${data.parent_folder_id || null},
        ${data.description || null},
        ${data.color || null},
        ${data.strategy_id || null}
      ) RETURNING *
    `;
    return result[0];
  },

  async getAssetFoldersByUserId(userId: string) {
    const result = await sql`
      SELECT * FROM asset_folders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result;
  },

  async getAssetFolderById(folderId: string) {
    const result = await sql`
      SELECT * FROM asset_folders
      WHERE id = ${folderId}
    `;
    return result[0];
  },

  async updateAssetFolder(folderId: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parent_folder_id?: string;
    strategy_id?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description || null);
    }
    if (data.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(data.color || null);
    }
    if (data.parent_folder_id !== undefined) {
      updates.push(`parent_folder_id = $${paramIndex++}`);
      values.push(data.parent_folder_id || null);
    }
    if (data.strategy_id !== undefined) {
      updates.push(`strategy_id = $${paramIndex++}`);
      values.push(data.strategy_id || null);
    }

    if (updates.length === 0) {
      // No updates provided, return current folder
      return this.getAssetFolderById(folderId);
    }

    updates.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE asset_folders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      [...values, folderId]
    );
    return result[0];
  },

  async deleteAssetFolder(folderId: string) {
    await sql`DELETE FROM asset_folders WHERE id = ${folderId}`;
  },

  async trackAssetUsage(data: {
    asset_id: string;
    entity_type: 'post' | 'mou' | 'strategy';
    entity_id: string;
    usage_type?: string;
  }) {
    const result = await sql`
      INSERT INTO asset_usage (asset_id, entity_type, entity_id, usage_type)
      VALUES (${data.asset_id}, ${data.entity_type}, ${data.entity_id}, ${data.usage_type || null})
      RETURNING *
    `;
    return result[0];
  },

  async getAssetUsage(assetId: string) {
    const result = await sql`
      SELECT * FROM asset_usage
      WHERE asset_id = ${assetId}
      ORDER BY created_at DESC
    `;
    return result;
  },

  async getAssetUsageCount(assetId: string) {
    const result = await sql`
      SELECT COUNT(*) as count FROM asset_usage
      WHERE asset_id = ${assetId}
    `;
    return parseInt(result[0].count);
  },

  async createAssetUsage(data: {
    asset_id: string;
    entity_type: string;
    entity_id: string;
    usage_type?: string;
  }) {
    const result = await sql`
      INSERT INTO asset_usage (
        asset_id, entity_type, entity_id, usage_type
      ) VALUES (
        ${data.asset_id},
        ${data.entity_type},
        ${data.entity_id},
        ${data.usage_type || null}
      )
      RETURNING *
    `;
    return result[0];
  },

  async deleteAssetUsage(assetId: string, entityType?: string, entityId?: string) {
    if (entityType && entityId) {
      await sql`
        DELETE FROM asset_usage
        WHERE asset_id = ${assetId}
          AND entity_type = ${entityType}
          AND entity_id = ${entityId}
      `;
    } else {
      await sql`
        DELETE FROM asset_usage
        WHERE asset_id = ${assetId}
      `;
    }
  },

  async deleteAssetUsageByEntity(entityType: string, entityId: string, usageType?: string) {
    if (usageType) {
      await sql`
        DELETE FROM asset_usage
        WHERE entity_type = ${entityType}
          AND entity_id = ${entityId}
          AND usage_type = ${usageType}
      `;
    } else {
      await sql`
        DELETE FROM asset_usage
        WHERE entity_type = ${entityType}
          AND entity_id = ${entityId}
      `;
    }
  },

  // Free Audit Tracking
  async getFreeAuditsByIP(ipAddress: string, hoursAgo: number = 24) {
    const result = await query(
      `SELECT * FROM free_audit_usage
       WHERE ip_address = $1
       AND created_at > NOW() - INTERVAL '${hoursAgo} hours'
       ORDER BY created_at DESC`,
      [ipAddress]
    );
    return result;
  },

  async getFreeAuditByDomain(domain: string) {
    const result = await query(
      `SELECT * FROM free_audit_usage
       WHERE domain = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [domain]
    );
    return result[0] || null;
  },

  async createFreeAuditRecord(data: {
    ip_address: string;
    domain: string;
    url: string;
    audit_data?: any;
  }) {
    const result = await query(
      `INSERT INTO free_audit_usage (ip_address, domain, url, audit_data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.ip_address, data.domain, data.url, data.audit_data ? JSON.stringify(data.audit_data) : null]
    );
    return result[0];
  },

  async getFreeAuditCount(ipAddress: string, hoursAgo: number = 24) {
    const result = await query(
      `SELECT COUNT(*) as count FROM free_audit_usage
       WHERE ip_address = $1
       AND created_at > NOW() - INTERVAL '${hoursAgo} hours'`,
      [ipAddress]
    );
    return parseInt(result[0]?.count || '0', 10);
  },

  // Admin Analytics Functions
  async getAllFreeAudits(limit: number = 100, offset: number = 0) {
    return await query(
      `SELECT
        fa.*,
        u.email as converted_user_email,
        u.name as converted_user_name,
        u.subscription_tier
       FROM free_audit_usage fa
       LEFT JOIN users u ON fa.converted_user_id = u.id
       ORDER BY fa.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  },

  async getFreeAuditAnalytics() {
    const result = await query(`
      SELECT
        COUNT(*) as total_audits,
        COUNT(DISTINCT ip_address) as unique_ips,
        COUNT(DISTINCT domain) as unique_domains,
        COUNT(CASE WHEN converted = true THEN 1 END) as converted_count,
        COUNT(CASE WHEN converted = true AND is_domain_owner = true THEN 1 END) as domain_owner_conversions,
        COUNT(CASE WHEN converted = true AND is_domain_owner = false THEN 1 END) as agency_conversions,
        ROUND(
          (COUNT(CASE WHEN converted = true THEN 1 END)::DECIMAL /
          COUNT(DISTINCT ip_address)::DECIMAL) * 100,
          2
        ) as conversion_rate
      FROM free_audit_usage
    `);
    return result[0];
  },

  async getFreeAuditsByDateRange(startDate: string, endDate: string) {
    return await query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as audits,
        COUNT(DISTINCT ip_address) as unique_users,
        COUNT(CASE WHEN converted = true THEN 1 END) as conversions
       FROM free_audit_usage
       WHERE created_at >= $1 AND created_at < $2
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
  },

  async getTopAuditedDomains(limit: number = 20) {
    return await query(
      `SELECT
        domain,
        COUNT(*) as audit_count,
        COUNT(DISTINCT ip_address) as unique_auditors,
        COUNT(CASE WHEN converted = true THEN 1 END) as conversions,
        AVG((audit_data->>'scores'->>'seo')::DECIMAL) as avg_seo_score,
        AVG((audit_data->'scores'->>'readability')::DECIMAL) as avg_readability_score
       FROM free_audit_usage
       GROUP BY domain
       ORDER BY audit_count DESC
       LIMIT $1`,
      [limit]
    );
  },

  async getScoringIssues() {
    return await query(`
      SELECT
        url,
        domain,
        audit_data->'scores' as scores,
        audit_data->'details' as details,
        created_at
       FROM free_audit_usage
       WHERE
        (audit_data->'scores'->>'seo')::DECIMAL < 30 OR
        (audit_data->'scores'->>'readability')::DECIMAL < 30 OR
        (audit_data->'scores'->>'engagement')::DECIMAL < 30
       ORDER BY created_at DESC
       LIMIT 50
    `);
  },

  async markFreeAuditConverted(ipAddress: string, userId: number, email: string) {
    // Get all free audits from this IP in the last 30 days
    const audits = await query(
      `SELECT * FROM free_audit_usage
       WHERE ip_address = $1
       AND created_at > NOW() - INTERVAL '30 days'
       AND converted = false`,
      [ipAddress]
    );

    if (audits.length === 0) {
      return { updated: 0 };
    }

    // Determine if user owns the domains they audited
    const emailDomain = email.split('@')[1]?.toLowerCase();

    for (const audit of audits) {
      const auditDomain = audit.domain?.toLowerCase();
      const isDomainOwner = emailDomain && auditDomain &&
        (auditDomain.includes(emailDomain) || emailDomain.includes(auditDomain));

      await query(
        `UPDATE free_audit_usage
         SET converted = true,
             converted_user_id = $1,
             converted_at = NOW(),
             is_domain_owner = $2
         WHERE id = $3`,
        [userId, isDomainOwner, audit.id]
      );
    }

    return { updated: audits.length, audits };
  },

  async updateFreeAuditMetadata(id: number, userAgent: string, referrer: string) {
    await query(
      `UPDATE free_audit_usage
       SET user_agent = $1, referrer = $2
       WHERE id = $3`,
      [userAgent, referrer, id]
    );
  },

  // ============================================================================
  // Technical SEO Audits
  // ============================================================================

  async createTechnicalSeoAudit(data: {
    user_id: number | string;
    content_audit_id?: number;
    url: string;
    overall_score: number;
    ai_searchability_score: number;
    technical_seo_score: number;
    agency_fixable_count: number;
    owner_action_count: number;
    estimated_min_cost?: number;
    estimated_max_cost?: number;
    agency_can_fix: any;
    owner_must_change: any;
    checks: any;
    recommendations: any;
    scan_version?: string;
  }) {
    const result = await query(
      `INSERT INTO technical_seo_audits (
        user_id, content_audit_id, url,
        overall_score, ai_searchability_score, technical_seo_score,
        agency_fixable_count, owner_action_count,
        estimated_min_cost, estimated_max_cost,
        agency_can_fix, owner_must_change, checks, recommendations,
        scan_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        data.user_id,
        data.content_audit_id || null,
        data.url,
        data.overall_score,
        data.ai_searchability_score,
        data.technical_seo_score,
        data.agency_fixable_count,
        data.owner_action_count,
        data.estimated_min_cost || null,
        data.estimated_max_cost || null,
        JSON.stringify(data.agency_can_fix),
        JSON.stringify(data.owner_must_change),
        JSON.stringify(data.checks),
        JSON.stringify(data.recommendations),
        data.scan_version || '1.0.0',
      ]
    );
    return result[0];
  },

  async getTechnicalSeoAuditsByUserId(userId: number | string, limit = 50) {
    return await query(
      `SELECT * FROM technical_seo_audits
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  },

  async getTechnicalSeoAuditById(id: number) {
    const result = await query(
      'SELECT * FROM technical_seo_audits WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async getTechnicalSeoAuditByContentAuditId(contentAuditId: number) {
    const result = await query(
      'SELECT * FROM technical_seo_audits WHERE content_audit_id = $1 ORDER BY created_at DESC LIMIT 1',
      [contentAuditId]
    );
    return result[0] || null;
  },

  async getTechnicalSeoAuditByUrl(url: string, userId: number | string) {
    const result = await query(
      'SELECT * FROM technical_seo_audits WHERE url = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1',
      [url, userId]
    );
    return result[0] || null;
  },

  // ============================================================================
  // Agencies (Marketplace)
  // ============================================================================

  async createAgency(data: {
    user_id: number | string;
    agency_name: string;
    contact_email: string;
    contact_phone?: string;
    website_url?: string;
    city?: string;
    state?: string;
    country?: string;
    vertical_specialization?: string[];
    services_offered?: string[];
    portfolio_url?: string;
    case_studies?: any[];
    client_count?: number;
    base_audit_price_cents?: number;
    hourly_rate_cents?: number;
    max_active_clients?: number;
    certification_status?: string;
    accepting_leads?: boolean;
  }) {
    const result = await query(
      `INSERT INTO agencies (
        user_id, agency_name, contact_email, contact_phone, website_url,
        city, state, country,
        vertical_specialization, services_offered,
        portfolio_url, case_studies, client_count,
        base_audit_price_cents, hourly_rate_cents,
        max_active_clients, certification_status, accepting_leads
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        data.user_id,
        data.agency_name,
        data.contact_email,
        data.contact_phone || null,
        data.website_url || null,
        data.city || null,
        data.state || null,
        data.country || 'USA',
        data.vertical_specialization || [],
        data.services_offered || [],
        data.portfolio_url || null,
        JSON.stringify(data.case_studies || []),
        data.client_count || 0,
        data.base_audit_price_cents || null,
        data.hourly_rate_cents || null,
        data.max_active_clients || 10,
        data.certification_status || 'pending',
        data.accepting_leads !== undefined ? data.accepting_leads : false,
      ]
    );
    return result[0];
  },

  async getAgencyByUserId(userId: number | string) {
    const result = await query(
      'SELECT * FROM agencies WHERE user_id = $1',
      [userId]
    );
    return result[0] || null;
  },

  async getAgencyById(id: number) {
    const result = await query(
      'SELECT * FROM agencies WHERE id = $1',
      [id]
    );
    return result[0] || null;
  },

  async getApprovedAgencies(limit = 100) {
    return await query(
      `SELECT * FROM agencies
       WHERE certification_status = 'approved'
       AND accepting_leads = true
       ORDER BY client_satisfaction_score DESC NULLS LAST, leads_converted DESC
       LIMIT $1`,
      [limit]
    );
  },

  async getPendingAgencies() {
    return await query(
      `SELECT * FROM agencies
       WHERE certification_status = 'pending'
       ORDER BY application_submitted_at ASC`,
      []
    );
  },

  async updateAgencyCertification(
    agencyId: number,
    status: 'approved' | 'rejected' | 'suspended',
    approvedBy: number | string,
    notes?: string
  ) {
    const result = await query(
      `UPDATE agencies
       SET
         certification_status = $1,
         certified_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE certified_at END,
         approved_by = $2,
         certification_notes = $3
       WHERE id = $4
       RETURNING *`,
      [status, approvedBy, notes || null, agencyId]
    );
    return result[0];
  },

  async updateAgencyAcceptingLeads(agencyId: number, accepting: boolean) {
    const result = await query(
      `UPDATE agencies
       SET accepting_leads = $1
       WHERE id = $2
       RETURNING *`,
      [accepting, agencyId]
    );
    return result[0];
  },

  async updateAgencyProfile(agencyId: number, data: {
    agency_name?: string;
    contact_email?: string;
    contact_phone?: string;
    website_url?: string;
    city?: string;
    state?: string;
    country?: string;
    vertical_specialization?: string[];
    services_offered?: string[];
    portfolio_url?: string;
    client_count?: number;
    base_audit_price_cents?: number;
    hourly_rate_cents?: number;
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(agencyId);

    const result = await query(
      `UPDATE agencies SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result[0];
  },

  // ============================================================================
  // Agency Lead Referrals
  // ============================================================================

  async createAgencyLeadReferral(data: {
    agency_id: number;
    lead_email: string;
    lead_name?: string;
    lead_phone?: string;
    lead_company?: string;
    lead_url?: string;
    technical_seo_audit_id?: number;
    issue_summary?: string;
    estimated_deal_value_cents?: number;
    commission_percentage?: number;
  }) {
    const result = await query(
      `INSERT INTO agency_lead_referrals (
        agency_id, lead_email, lead_name, lead_phone, lead_company, lead_url,
        technical_seo_audit_id, issue_summary, estimated_deal_value_cents,
        commission_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.agency_id,
        data.lead_email,
        data.lead_name || null,
        data.lead_phone || null,
        data.lead_company || null,
        data.lead_url || null,
        data.technical_seo_audit_id || null,
        data.issue_summary || null,
        data.estimated_deal_value_cents || null,
        data.commission_percentage || 20.0,
      ]
    );

    // Increment leads_received count
    await query(
      'UPDATE agencies SET leads_received = leads_received + 1 WHERE id = $1',
      [data.agency_id]
    );

    return result[0];
  },

  async getLeadReferralsByAgencyId(agencyId: number, limit = 50) {
    return await query(
      `SELECT * FROM agency_lead_referrals
       WHERE agency_id = $1
       ORDER BY sent_at DESC
       LIMIT $2`,
      [agencyId, limit]
    );
  },

  async updateLeadReferralStatus(
    referralId: number,
    status: 'sent' | 'accepted' | 'declined' | 'converted' | 'lost',
    actualDealValue?: number,
    notes?: string
  ) {
    const result = await query(
      `UPDATE agency_lead_referrals
       SET
         status = $1,
         responded_at = CASE WHEN $1 IN ('accepted', 'declined') AND responded_at IS NULL THEN NOW() ELSE responded_at END,
         converted_at = CASE WHEN $1 = 'converted' THEN NOW() ELSE converted_at END,
         actual_deal_value_cents = COALESCE($2, actual_deal_value_cents),
         commission_amount_cents = CASE
           WHEN $1 = 'converted' AND $2 IS NOT NULL
           THEN ROUND($2 * commission_percentage / 100)
           ELSE commission_amount_cents
         END,
         agency_notes = COALESCE($3, agency_notes)
       WHERE id = $4
       RETURNING *`,
      [status, actualDealValue || null, notes || null, referralId]
    );
    return result[0];
  },

  async getUnpaidCommissions() {
    return await query(
      `SELECT alr.*, a.agency_name, a.contact_email
       FROM agency_lead_referrals alr
       JOIN agencies a ON a.id = alr.agency_id
       WHERE alr.status = 'converted'
       AND alr.commission_paid = false
       AND alr.commission_amount_cents > 0
       ORDER BY alr.converted_at DESC`,
      []
    );
  },

  async markCommissionPaid(referralId: number) {
    const result = await query(
      `UPDATE agency_lead_referrals
       SET commission_paid = true, commission_paid_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [referralId]
    );

    // Update agency's total commission paid
    if (result[0]) {
      await query(
        `UPDATE agencies
         SET total_commission_paid_cents = total_commission_paid_cents + $1
         WHERE id = $2`,
        [result[0].commission_amount_cents, result[0].agency_id]
      );
    }

    return result[0];
  },

  // Tasks
  async createTask(data: {
    user_id: string;
    lead_id?: number;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: Date;
    tags?: string[];
    is_auto_generated?: boolean;
    source_type?: string;
    source_id?: number;
  }) {
    const result = await sql`
      INSERT INTO tasks (
        user_id, lead_id, title, description, status, priority,
        due_date, tags, is_auto_generated, source_type, source_id
      ) VALUES (
        ${data.user_id},
        ${data.lead_id || null},
        ${data.title},
        ${data.description || null},
        ${data.status || 'todo'},
        ${data.priority || 'medium'},
        ${data.due_date || null},
        ${data.tags ? sql.array(data.tags) : sql.array([])},
        ${data.is_auto_generated || false},
        ${data.source_type || null},
        ${data.source_id || null}
      ) RETURNING *
    `;
    return result[0];
  },

  async getTasksByUserId(userId: string, filters?: {
    lead_id?: number;
    status?: string;
    include_completed?: boolean;
  }) {
    let queryText = 'SELECT t.*, l.business_name as client_name FROM tasks t LEFT JOIN leads l ON t.lead_id = l.id WHERE t.user_id = $1';
    const params: any[] = [userId];
    let paramCount = 2;

    if (filters?.lead_id) {
      queryText += ` AND t.lead_id = $${paramCount++}`;
      params.push(filters.lead_id);
    }

    if (filters?.status) {
      queryText += ` AND t.status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (!filters?.include_completed) {
      queryText += ` AND t.status != 'done'`;
    }

    queryText += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';

    return await query(queryText, params);
  },

  async getTaskById(id: number) {
    const result = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result[0] || null;
  },

  async updateTask(id: number, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: Date | null;
    tags?: string[];
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
      if (data.status === 'done') {
        updates.push(`completed_at = NOW()`);
      }
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }
    if (data.due_date !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(data.due_date);
    }
    if (data.tags !== undefined) {
      updates.push(`tags = $${paramCount++}`);
      values.push(data.tags);
    }

    if (updates.length === 0) return this.getTaskById(id);

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0];
  },

  async deleteTask(id: number) {
    await query('DELETE FROM tasks WHERE id = $1', [id]);
  },

  async getOverdueTasks(userId: string) {
    return await query(
      `SELECT t.*, l.business_name as client_name
       FROM tasks t
       LEFT JOIN leads l ON t.lead_id = l.id
       WHERE t.user_id = $1
       AND t.status != 'done'
       AND t.due_date < NOW()
       ORDER BY t.due_date ASC`,
      [userId]
    );
  },

  async getUpcomingTasks(userId: string, days: number = 7) {
    return await query(
      `SELECT t.*, l.business_name as client_name
       FROM tasks t
       LEFT JOIN leads l ON t.lead_id = l.id
       WHERE t.user_id = $1
       AND t.status != 'done'
       AND t.due_date IS NOT NULL
       AND t.due_date > NOW()
       AND t.due_date < NOW() + INTERVAL '${days} days'
       ORDER BY t.due_date ASC`,
      [userId]
    );
  },

  async getTaskStats(userId: string) {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done,
        COUNT(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 END) as overdue
       FROM tasks
       WHERE user_id = $1`,
      [userId]
    );
    return result[0];
  },

  // Domain Locking for Starter tier
  async setLockedDomain(userId: number | string, domain: string) {
    const result = await query(
      `UPDATE users
       SET locked_domain = $1
       WHERE id = $2 AND locked_domain IS NULL
       RETURNING locked_domain`,
      [domain, userId]
    );
    return result[0]?.locked_domain || null;
  },

  async getLockedDomain(userId: number | string) {
    const result = await query(
      `SELECT locked_domain FROM users WHERE id = $1`,
      [userId]
    );
    return result[0]?.locked_domain || null;
  },

  async clearLockedDomain(userId: number | string) {
    await query(
      `UPDATE users SET locked_domain = NULL WHERE id = $1`,
      [userId]
    );
  },

  // WordPress Integration
  async getStrategyByTopicId(topicId: string) {
    const result = await query(
      `SELECT s.* FROM strategies s
       JOIN topics t ON t.strategy_id = s.id
       WHERE t.id = $1`,
      [topicId]
    );
    return result[0] || null;
  },

  async updateStrategyWordPress(strategyId: string, data: {
    wordpress_enabled?: boolean;
    wordpress_url?: string;
    wordpress_username?: string;
    wordpress_app_password?: string;
    wordpress_category_id?: number;
    wordpress_category_name?: string;
    wordpress_author_id?: number;
    wordpress_author_name?: string;
    wordpress_default_status?: string;
    wordpress_connection_verified?: boolean;
    wordpress_last_test_at?: Date;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.wordpress_enabled !== undefined) {
      updates.push(`wordpress_enabled = $${paramCount++}`);
      values.push(data.wordpress_enabled);
    }
    if (data.wordpress_url !== undefined) {
      updates.push(`wordpress_url = $${paramCount++}`);
      values.push(data.wordpress_url);
    }
    if (data.wordpress_username !== undefined) {
      updates.push(`wordpress_username = $${paramCount++}`);
      values.push(data.wordpress_username);
    }
    if (data.wordpress_app_password !== undefined) {
      updates.push(`wordpress_app_password = $${paramCount++}`);
      values.push(data.wordpress_app_password);
    }
    if (data.wordpress_category_id !== undefined) {
      updates.push(`wordpress_category_id = $${paramCount++}`);
      values.push(data.wordpress_category_id);
    }
    if (data.wordpress_category_name !== undefined) {
      updates.push(`wordpress_category_name = $${paramCount++}`);
      values.push(data.wordpress_category_name);
    }
    if (data.wordpress_author_id !== undefined) {
      updates.push(`wordpress_author_id = $${paramCount++}`);
      values.push(data.wordpress_author_id);
    }
    if (data.wordpress_author_name !== undefined) {
      updates.push(`wordpress_author_name = $${paramCount++}`);
      values.push(data.wordpress_author_name);
    }
    if (data.wordpress_default_status !== undefined) {
      updates.push(`wordpress_default_status = $${paramCount++}`);
      values.push(data.wordpress_default_status);
    }
    if (data.wordpress_connection_verified !== undefined) {
      updates.push(`wordpress_connection_verified = $${paramCount++}`);
      values.push(data.wordpress_connection_verified);
    }
    if (data.wordpress_last_test_at !== undefined) {
      updates.push(`wordpress_last_test_at = $${paramCount++}`);
      values.push(data.wordpress_last_test_at);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      // Only updated_at, nothing to update
      return await this.getStrategyById(strategyId);
    }

    values.push(strategyId);

    const result = await query(
      `UPDATE strategies SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  async updatePostWordPress(postId: string, data: {
    wordpress_post_id?: number;
    wordpress_post_url?: string;
    wordpress_published_at?: Date;
    wordpress_last_sync_at?: Date;
    status?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.wordpress_post_id !== undefined) {
      updates.push(`wordpress_post_id = $${paramCount++}`);
      values.push(data.wordpress_post_id);
    }
    if (data.wordpress_post_url !== undefined) {
      updates.push(`wordpress_post_url = $${paramCount++}`);
      values.push(data.wordpress_post_url);
    }
    if (data.wordpress_published_at !== undefined) {
      updates.push(`wordpress_published_at = $${paramCount++}`);
      values.push(data.wordpress_published_at);
    }
    if (data.wordpress_last_sync_at !== undefined) {
      updates.push(`wordpress_last_sync_at = $${paramCount++}`);
      values.push(data.wordpress_last_sync_at);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    updates.push(`updated_at = NOW()`);

    values.push(postId);

    const result = await query(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  // Bulk Jobs
  async createBulkJob(data: {
    id: string;
    user_id: string;
    strategy_id: string;
    job_type: 'generate' | 'approve' | 'export';
    status: string;
    total_items: number;
    completed_items: number;
    failed_items: number;
    topic_ids: string[];
  }) {
    const result = await query(
      `INSERT INTO bulk_jobs (
        id, user_id, strategy_id, job_type, status,
        total_items, completed_items, failed_items, topic_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.id,
        data.user_id,
        data.strategy_id,
        data.job_type,
        data.status,
        data.total_items,
        data.completed_items,
        data.failed_items,
        JSON.stringify(data.topic_ids),
      ]
    );
    return result[0];
  },

  async getBulkJob(jobId: string) {
    const result = await query(
      'SELECT * FROM bulk_jobs WHERE id = $1',
      [jobId]
    );
    return result[0] || null;
  },

  async getBulkJobsByStrategy(strategyId: string, userId: string) {
    return await query(
      `SELECT * FROM bulk_jobs
       WHERE strategy_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 10`,
      [strategyId, userId]
    );
  },

  async getRunningBulkJobsForUser(userId: string) {
    return await query(
      `SELECT * FROM bulk_jobs
       WHERE user_id = $1 AND status IN ('pending', 'processing')
       ORDER BY created_at DESC`,
      [userId]
    );
  },

  async updateBulkJob(jobId: string, data: {
    status?: string;
    completed_items?: number;
    failed_items?: number;
    results?: string;
    error?: string;
    completed_at?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.completed_items !== undefined) {
      updates.push(`completed_items = $${paramCount++}`);
      values.push(data.completed_items);
    }
    if (data.failed_items !== undefined) {
      updates.push(`failed_items = $${paramCount++}`);
      values.push(data.failed_items);
    }
    if (data.results !== undefined) {
      updates.push(`results = $${paramCount++}`);
      values.push(data.results);
    }
    if (data.error !== undefined) {
      updates.push(`error = $${paramCount++}`);
      values.push(data.error);
    }
    if (data.completed_at !== undefined) {
      updates.push(`completed_at = $${paramCount++}`);
      values.push(data.completed_at);
    }

    updates.push(`updated_at = NOW()`);
    values.push(jobId);

    const result = await query(
      `UPDATE bulk_jobs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  // ============================================
  // AI Visibility Tracking (Internal Only)
  // ============================================

  async createAIVisibilityMonitor(data: {
    user_id: string;
    url: string;
    domain: string;
    business_name?: string;
    industry?: string;
    target_keywords?: string[];
    check_frequency?: string;
    notes?: string;
  }) {
    const result = await query(
      `INSERT INTO ai_visibility_monitors (
        user_id, url, domain, business_name, industry,
        target_keywords, check_frequency, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.user_id,
        data.url,
        data.domain,
        data.business_name || null,
        data.industry || null,
        data.target_keywords || [],
        data.check_frequency || 'weekly',
        data.notes || null,
      ]
    );
    return result[0];
  },

  async getAIVisibilityMonitorsByUser(userId: string) {
    return await query(
      `SELECT * FROM ai_visibility_monitors
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
  },

  async getAIVisibilityMonitorById(id: string) {
    const result = await query(
      `SELECT * FROM ai_visibility_monitors WHERE id = $1`,
      [id]
    );
    return result[0] || null;
  },

  async updateAIVisibilityMonitor(id: string, data: {
    target_keywords?: string[];
    is_active?: boolean;
    check_frequency?: string;
    last_checked_at?: Date;
    notes?: string;
  }) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.target_keywords !== undefined) {
      updates.push(`target_keywords = $${paramCount++}`);
      values.push(data.target_keywords);
    }
    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.is_active);
    }
    if (data.check_frequency !== undefined) {
      updates.push(`check_frequency = $${paramCount++}`);
      values.push(data.check_frequency);
    }
    if (data.last_checked_at !== undefined) {
      updates.push(`last_checked_at = $${paramCount++}`);
      values.push(data.last_checked_at);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE ai_visibility_monitors SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result[0] || null;
  },

  async deleteAIVisibilityMonitor(id: string) {
    await query(`DELETE FROM ai_visibility_monitors WHERE id = $1`, [id]);
  },

  async createAIVisibilityCheck(data: {
    monitor_id: string;
    platform: string;
    query_used: string;
    keyword?: string;
    was_cited: boolean;
    citation_type?: string;
    citation_position?: number;
    response_snippet?: string;
    sources_returned?: string[];
    full_response?: string;
  }) {
    const result = await query(
      `INSERT INTO ai_visibility_checks (
        monitor_id, platform, query_used, keyword,
        was_cited, citation_type, citation_position,
        response_snippet, sources_returned, full_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.monitor_id,
        data.platform,
        data.query_used,
        data.keyword || null,
        data.was_cited,
        data.citation_type || null,
        data.citation_position || null,
        data.response_snippet || null,
        data.sources_returned || [],
        data.full_response || null,
      ]
    );
    return result[0];
  },

  async getAIVisibilityChecksByMonitor(monitorId: string, limit = 50) {
    return await query(
      `SELECT * FROM ai_visibility_checks
       WHERE monitor_id = $1
       ORDER BY check_date DESC
       LIMIT $2`,
      [monitorId, limit]
    );
  },

  async getRecentAIVisibilityChecks(userId: string, limit = 20) {
    return await query(
      `SELECT c.*, m.url, m.domain, m.business_name
       FROM ai_visibility_checks c
       JOIN ai_visibility_monitors m ON c.monitor_id = m.id
       WHERE m.user_id = $1
       ORDER BY c.check_date DESC
       LIMIT $2`,
      [userId, limit]
    );
  },

  async getAIVisibilityStats(monitorId: string) {
    const result = await query(
      `SELECT
        COUNT(*) as total_checks,
        SUM(CASE WHEN was_cited THEN 1 ELSE 0 END) as total_citations,
        ROUND(AVG(CASE WHEN was_cited THEN citation_position ELSE NULL END)::numeric, 1) as avg_position,
        SUM(CASE WHEN platform = 'perplexity' THEN 1 ELSE 0 END) as perplexity_checks,
        SUM(CASE WHEN platform = 'perplexity' AND was_cited THEN 1 ELSE 0 END) as perplexity_citations
       FROM ai_visibility_checks
       WHERE monitor_id = $1`,
      [monitorId]
    );
    return result[0] || null;
  },

  async getAllAIVisibilityMonitors() {
    return await query(
      `SELECT m.*, u.email as user_email
       FROM ai_visibility_monitors m
       JOIN users u ON m.user_id = u.id
       WHERE m.is_active = true
       ORDER BY m.last_checked_at ASC NULLS FIRST`
    );
  },
};
