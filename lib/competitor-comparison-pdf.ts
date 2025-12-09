import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompetitorScore {
  url: string;
  domain: string;
  isTarget: boolean;
  overall: number;
  aeo: number;
  seo: number;
  readability: number;
  engagement: number;
}

interface CompetitorComparisonData {
  target: CompetitorScore;
  competitors: CompetitorScore[];
  ranking: {
    position: number;
    total: number;
  };
  insights: {
    winning: string[];
    losing: string[];
    opportunities: string[];
    salesPitch: string;
  };
  generatedDate?: string;
}

/**
 * Generate a professional competitor comparison PDF
 */
export function generateCompetitorComparisonPDF(data: CompetitorComparisonData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Competitor Analysis Report', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('AI Readiness Comparison', margin, 30);

  doc.setFontSize(10);
  doc.text(`Generated: ${data.generatedDate || new Date().toLocaleDateString()}`, margin, 38);

  yPos = 55;

  // Target Summary Box
  doc.setFillColor(255, 237, 213); // orange-100
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F');

  doc.setTextColor(154, 52, 18); // orange-800
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TARGET WEBSITE', margin + 5, yPos + 8);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.target.domain, margin + 5, yPos + 18);

  // Ranking badge
  const rankColor = data.ranking.position === 1 ? [34, 197, 94] :
                    data.ranking.position <= 2 ? [59, 130, 246] : [239, 68, 68];
  doc.setFillColor(rankColor[0], rankColor[1], rankColor[2]);
  doc.roundedRect(pageWidth - margin - 50, yPos + 5, 45, 25, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RANK', pageWidth - margin - 45, yPos + 13);
  doc.setFontSize(18);
  doc.text(`#${data.ranking.position}/${data.ranking.total}`, pageWidth - margin - 45, yPos + 25);

  yPos += 45;

  // Score Comparison Table
  checkPageBreak(80);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Comparison', margin, yPos);
  yPos += 10;

  const allSites = [data.target, ...data.competitors];
  const tableHead = ['Metric', ...allSites.map(s => s.isTarget ? `${s.domain} (Target)` : s.domain)];

  const metrics = [
    { key: 'overall', label: 'Overall Score' },
    { key: 'aeo', label: 'AI Answer Optimization' },
    { key: 'seo', label: 'Search Engine Optimization' },
    { key: 'readability', label: 'Content Readability' },
    { key: 'engagement', label: 'User Engagement' },
  ];

  const tableBody = metrics.map(m => [
    m.label,
    ...allSites.map(s => (s as any)[m.key]?.toString() || 'N/A')
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [tableHead],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: (tableData: any) => {
      yPos = tableData.cursor.y + 10;
    }
  });

  yPos += 10;

  // Sales Pitch Section
  checkPageBreak(50);

  doc.setFillColor(249, 115, 22);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('YOUR SALES PITCH', margin + 5, yPos + 6);
  yPos += 12;

  doc.setFillColor(255, 247, 237); // orange-50
  doc.rect(margin, yPos, pageWidth - margin * 2, 30, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const pitchLines = doc.splitTextToSize(data.insights.salesPitch, pageWidth - margin * 2 - 10);
  doc.text(pitchLines, margin + 5, yPos + 7);
  yPos += 35;

  // Insights Section
  checkPageBreak(60);

  // Winning Areas
  if (data.insights.winning.length > 0) {
    doc.setFillColor(220, 252, 231); // green-100
    doc.roundedRect(margin, yPos, (pageWidth - margin * 3) / 2, 8, 2, 2, 'F');

    doc.setTextColor(21, 128, 61);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('WHERE TARGET WINS', margin + 3, yPos + 6);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.insights.winning.forEach(item => {
      checkPageBreak(8);
      const lines = doc.splitTextToSize(`+ ${item}`, (pageWidth - margin * 3) / 2 - 5);
      doc.text(lines, margin + 3, yPos);
      yPos += lines.length * 4 + 2;
    });
    yPos += 5;
  }

  // Losing Areas
  if (data.insights.losing.length > 0) {
    checkPageBreak(30);

    doc.setFillColor(254, 226, 226); // red-100
    doc.roundedRect(margin, yPos, (pageWidth - margin * 3) / 2, 8, 2, 2, 'F');

    doc.setTextColor(185, 28, 28);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('WHERE TARGET LOSES', margin + 3, yPos + 6);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.insights.losing.forEach(item => {
      checkPageBreak(8);
      const lines = doc.splitTextToSize(`- ${item}`, (pageWidth - margin * 3) / 2 - 5);
      doc.text(lines, margin + 3, yPos);
      yPos += lines.length * 4 + 2;
    });
    yPos += 5;
  }

  // Opportunities
  if (data.insights.opportunities.length > 0) {
    checkPageBreak(40);

    doc.setFillColor(219, 234, 254); // blue-100
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8, 2, 2, 'F');

    doc.setTextColor(30, 64, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('OPPORTUNITIES TO PITCH', margin + 3, yPos + 6);
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.insights.opportunities.forEach((item, i) => {
      checkPageBreak(8);
      const lines = doc.splitTextToSize(`${i + 1}. ${item}`, pageWidth - margin * 2 - 10);
      doc.text(lines, margin + 3, yPos);
      yPos += lines.length * 4 + 2;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Generated by AISO Studio - aiso.studio',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const filename = `competitor-analysis-${data.target.domain}-${date}.pdf`;

  doc.save(filename);
}
