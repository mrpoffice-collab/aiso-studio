'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: {
    email: string;
    name?: string;
    company?: string;
    domain?: string;
  };
  leadId?: number;
  onSent?: () => void;
  suggestedTemplate?: 'outreach' | 'audit-results' | 'proposal' | 'welcome' | 'custom';
}

interface AgencyBranding {
  agency_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  signature_name?: string;
  signature_title?: string;
  signature_phone?: string;
  reply_to_email?: string;
}

const templateDefaults: Record<string, { subject: string; body: string }> = {
  outreach: {
    subject: 'Improving {{company}}\'s Online Visibility',
    body: `<p>Hi {{first_name}},</p>
<p>I came across {{company}} and noticed some opportunities to improve your online visibility and search rankings.</p>
<p>After a quick analysis of {{domain}}, I found a few areas where we could help:</p>
<ul>
<li>Accessibility improvements for better user experience</li>
<li>Content optimization for AI search engines</li>
<li>Technical SEO enhancements</li>
</ul>
<p>Would you be open to a quick call to discuss how we can help {{company}} reach more customers online?</p>
<p>Best regards,</p>`,
  },
  'audit-results': {
    subject: 'Your AISO Audit Results for {{domain}}',
    body: `<p>Hi {{first_name}},</p>
<p>Your website audit for {{domain}} is complete! Here's a summary of what we found:</p>
<p><strong>Overall Score: {{aiso_score}}/100</strong></p>
<p>Key findings:</p>
<ul>
<li>Accessibility Score: {{wcag_score}}</li>
<li>Critical issues found: {{critical_issues}}</li>
</ul>
<p>I've attached the full report for your review. Let me know if you'd like to discuss the recommendations.</p>
<p>Best,</p>`,
  },
  proposal: {
    subject: 'Content Strategy Proposal for {{company}}',
    body: `<p>Hi {{first_name}},</p>
<p>Thank you for your interest in improving {{company}}'s online presence.</p>
<p>Based on our discussion, I've put together a content strategy that will help you:</p>
<ul>
<li>Rank higher in AI-powered search results</li>
<li>Establish authority in your industry</li>
<li>Generate more qualified leads</li>
</ul>
<p>Let me know when you're available to review the proposal together.</p>
<p>Looking forward to working with you,</p>`,
  },
  welcome: {
    subject: 'Welcome to the Team, {{company}}!',
    body: `<p>Hi {{first_name}},</p>
<p>Welcome aboard! We're thrilled to have {{company}} as a client.</p>
<p>Here's what happens next:</p>
<ol>
<li>We'll run a comprehensive audit of {{domain}}</li>
<li>Create your custom content strategy</li>
<li>Begin producing optimized content</li>
</ol>
<p>If you have any questions, don't hesitate to reach out.</p>
<p>Excited to get started,</p>`,
  },
  custom: {
    subject: '',
    body: '<p>Hi {{first_name}},</p><p></p><p>Best,</p>',
  },
};

export default function EmailComposer({
  isOpen,
  onClose,
  recipient,
  leadId,
  onSent,
  suggestedTemplate = 'custom',
}: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [branding, setBranding] = useState<AgencyBranding>({});
  const [selectedTemplate, setSelectedTemplate] = useState(suggestedTemplate);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your email...',
      }),
    ],
    content: templateDefaults[selectedTemplate]?.body || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  useEffect(() => {
    loadBranding();
  }, []);

  useEffect(() => {
    if (selectedTemplate && templateDefaults[selectedTemplate]) {
      setSubject(templateDefaults[selectedTemplate].subject);
      editor?.commands.setContent(templateDefaults[selectedTemplate].body);
    }
  }, [selectedTemplate, editor]);

  const loadBranding = async () => {
    try {
      const response = await fetch('/api/settings/branding');
      if (response.ok) {
        const data = await response.json();
        setBranding(data.branding || {});
      }
    } catch (err) {
      console.error('Failed to load branding:', err);
    }
  };

  const replaceVariables = (text: string): string => {
    const variables: Record<string, string> = {
      '{{first_name}}': recipient?.name?.split(' ')[0] || 'there',
      '{{company}}': recipient?.company || 'your company',
      '{{domain}}': recipient?.domain || 'your website',
      '{{aiso_score}}': '0',
      '{{wcag_score}}': '0',
      '{{critical_issues}}': '0',
      '{{agency_name}}': branding.agency_name || 'Our Agency',
      '{{signature_name}}': branding.signature_name || '',
      '{{signature_title}}': branding.signature_title || '',
      '{{signature_phone}}': branding.signature_phone || '',
    };

    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return result;
  };

  const insertVariable = (variable: string) => {
    editor?.commands.insertContent(variable);
  };

  const handleSend = async () => {
    if (!recipient?.email || !subject || !editor?.getHTML()) {
      setError('Please fill in all required fields');
      return;
    }

    setSending(true);
    setError('');

    try {
      const finalSubject = replaceVariables(subject);
      const finalBody = replaceVariables(editor.getHTML());

      // Build branded HTML email
      const brandedHtml = buildBrandedEmail(finalBody, branding);

      const response = await fetch(`/api/leads/${leadId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.email,
          subject: finalSubject,
          html: brandedHtml,
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      onSent?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const buildBrandedEmail = (bodyHtml: string, branding: AgencyBranding): string => {
    const primaryColor = branding.primary_color || '#f97316';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 24px; background-color: ${primaryColor}; text-align: center;">
        ${branding.logo_url
          ? `<img src="${branding.logo_url}" alt="${branding.agency_name || 'Agency'}" style="max-height: 50px; max-width: 200px;">`
          : `<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">${branding.agency_name || 'AISO Studio'}</h1>`
        }
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px 24px;">
        ${bodyHtml}

        <!-- Signature -->
        ${branding.signature_name ? `
        <table style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <tr>
            <td>
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">${branding.signature_name}</p>
              ${branding.signature_title ? `<p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">${branding.signature_title}</p>` : ''}
              ${branding.signature_phone ? `<p style="margin: 0; color: #64748b; font-size: 14px;">📞 ${branding.signature_phone}</p>` : ''}
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 24px; background-color: #f1f5f9; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 12px;">
          Sent via AISO Studio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Compose Email</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!showPreview ? (
            <div className="p-4">
              {/* To */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                <input
                  type="email"
                  value={recipient?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              {/* Template */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="outreach">Outreach</option>
                  <option value="audit-results">Audit Results</option>
                  <option value="proposal">Proposal</option>
                  <option value="welcome">Welcome</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Email subject..."
                />
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-slate-50 rounded-t-lg border border-b-0 border-slate-200">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                  title="Bold"
                >
                  <span className="font-bold">B</span>
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                  title="Italic"
                >
                  <span className="italic">I</span>
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                  title="Bullet List"
                >
                  •
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
                  title="Numbered List"
                >
                  1.
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <div className="relative group">
                  <button className="p-2 rounded hover:bg-slate-100" title="Insert Variable">
                    {'{{}}'}
                  </button>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-10 min-w-[160px]">
                    {['{{first_name}}', '{{company}}', '{{domain}}', '{{aiso_score}}', '{{wcag_score}}'].map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="border border-slate-200 rounded-b-lg min-h-[200px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="p-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{
                    __html: buildBrandedEmail(
                      replaceVariables(editor?.getHTML() || ''),
                      branding
                    ),
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
