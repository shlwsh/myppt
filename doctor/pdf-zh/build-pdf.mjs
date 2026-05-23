import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(__dirname, 'paper_03_a_collaborative_intelligence-based_appro.md');
const pdfPath = path.join(__dirname, 'paper_03_a_collaborative_intelligence-based_appro.pdf');
const fontPath = 'C:/Windows/Fonts/msyh.ttc';

const text = fs.readFileSync(mdPath, 'utf8');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: '一种基于协作智能的人机协作不确定性处理方法',
    Author: 'Pai Zheng et al. (中文译本)',
  },
});

doc.pipe(fs.createWriteStream(pdfPath));
doc.registerFont('body', fontPath);
doc.font('body').fontSize(10);

const lines = text.split(/\r?\n/);
for (const line of lines) {
  if (line.startsWith('# ')) {
    doc.moveDown(0.3).fontSize(16).text(line.slice(2), { align: 'center' });
    doc.fontSize(10);
    continue;
  }
  if (line.startsWith('## ')) {
    doc.moveDown(0.6).fontSize(13).text(line.slice(3));
    doc.fontSize(10);
    continue;
  }
  if (line.startsWith('### ')) {
    doc.moveDown(0.4).fontSize(11).text(line.slice(4));
    doc.fontSize(10);
    continue;
  }
  if (line.trim() === '---') {
    doc.moveDown(0.3);
    continue;
  }
  if (line.trim() === '') {
    doc.moveDown(0.2);
    continue;
  }
  doc.text(line, { lineGap: 2 });
}

doc.end();
console.log('Wrote', pdfPath);
