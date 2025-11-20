import postgres from 'postgres';

// Create PostgreSQL connection for Neon - v2
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,
});

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

  async getLeadProjectsByUserId(userId: number) {
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
    user_id: number;
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
    status?: string;
    opportunity_rating?: string;
  }) {
    try {
      const result = await query(
        `INSERT INTO leads (
          user_id, project_id, domain, business_name, city, state, industry,
          overall_score, content_score, seo_score, design_score, speed_score,
          has_blog, blog_post_count, last_blog_update, status, opportunity_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
          data.status || 'new',
          data.opportunity_rating || null,
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

  async getLeadsByUserId(userId: number, filters?: {
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

  async getLeadActivitiesByUserId(userId: number, limit: number = 50) {
    return await query(
      'SELECT * FROM lead_activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
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

  async getContentAuditsByUserId(userId: number, limit = 50) {
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

  async getUserSubscriptionInfo(userId: number) {
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

  async incrementArticleUsage(userId: number) {
    const result = await query(
      `UPDATE users
       SET articles_used_this_month = articles_used_this_month + 1
       WHERE id = $1
       RETURNING articles_used_this_month, article_limit`,
      [userId]
    );
    return result[0];
  },

  async resetMonthlyUsage(userId: number) {
    await query(
      `UPDATE users
       SET articles_used_this_month = 0,
           billing_cycle_start = CURRENT_TIMESTAMP,
           billing_cycle_end = CURRENT_TIMESTAMP + INTERVAL '1 month'
       WHERE id = $1`,
      [userId]
    );
  },
};
