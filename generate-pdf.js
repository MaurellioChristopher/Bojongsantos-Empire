#!/usr/bin/env node
/**
 * Script untuk mengkonversi PROJECT_DOCUMENTATION.md ke PDF
 * Simple Node.js script tanpa external dependencies berat
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Memulai konversi Markdown ke PDF...\n');

// Check if markdown file exists
const mdPath = path.join(__dirname, 'PROJECT_DOCUMENTATION.md');
if (!fs.existsSync(mdPath)) {
  console.error('❌ File PROJECT_DOCUMENTATION.md tidak ditemukan!');
  process.exit(1);
}

console.log('✅ File markdown ditemukan');
console.log('📄 Menggunakan metode konversi online...\n');

// Create HTML version with embedded styles
const mdContent = fs.readFileSync(mdPath, 'utf-8');

const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AksesPangan - Dokumentasi Teknis</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px;
            background: #ffffff;
        }
        
        h1 {
            font-size: 2.5em;
            font-weight: 700;
            color: #143628;
            border-bottom: 4px solid #2D6A4F;
            padding-bottom: 10px;
            margin-top: 40px;
            page-break-before: always;
        }
        
        h1:first-of-type {
            page-break-before: avoid;
        }
        
        h2 {
            font-size: 2em;
            font-weight: 600;
            color: #1C4736;
            border-bottom: 2px solid #A8C8B0;
            padding-bottom: 8px;
            margin-top: 30px;
        }
        
        h3 {
            font-size: 1.5em;
            font-weight: 600;
            color: #2D6A4F;
            margin-top: 25px;
        }
        
        h4 {
            font-size: 1.2em;
            font-weight: 600;
            color: #3D7A59;
            margin-top: 20px;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        a {
            color: #2D6A4F;
            text-decoration: none;
            border-bottom: 1px solid #A8C8B0;
        }
        
        code {
            background-color: #F7F9F6;
            color: #A45E2A;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #0D1B2A;
            color: #E0E0E0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            border-left: 4px solid #2D6A4F;
            page-break-inside: avoid;
        }
        
        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        
        table thead {
            background-color: #143628;
            color: #F3F8F5;
        }
        
        table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #2D6A4F;
        }
        
        table td {
            padding: 10px 12px;
            border-bottom: 1px solid #DCE5DB;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #F7F9F6;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        hr {
            border: none;
            border-top: 2px solid #DCE5DB;
            margin: 30px 0;
        }
        
        blockquote {
            border-left: 4px solid #A45E2A;
            padding: 15px 20px;
            margin: 20px 0;
            color: #597367;
            background-color: #FBF0E6;
            border-radius: 4px;
        }
        
        @media print {
            body {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div id="content">
        ${mdContent
          .split('\n')
          .map(line => {
            // Simple markdown to HTML conversion
            if (line.startsWith('# ')) {
              return `<h1>${line.substring(2)}</h1>`;
            } else if (line.startsWith('## ')) {
              return `<h2>${line.substring(3)}</h2>`;
            } else if (line.startsWith('### ')) {
              return `<h3>${line.substring(4)}</h3>`;
            } else if (line.startsWith('#### ')) {
              return `<h4>${line.substring(5)}</h4>`;
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
              return `<li>${line.substring(2)}</li>`;
            } else if (line.startsWith('```')) {
              return line.includes('```') ? '<pre><code>' : '</code></pre>';
            } else if (line.trim() === '') {
              return '<br>';
            } else if (line.startsWith('|')) {
              // Simple table handling
              const cells = line.split('|').filter(c => c.trim());
              if (line.includes('---')) {
                return ''; // Skip separator line
              }
              const tags = cells.map(c => `<td>${c.trim()}</td>`).join('');
              return `<tr>${tags}</tr>`;
            } else {
              return `<p>${line}</p>`;
            }
          })
          .join('\n')}
    </div>
    
    <hr style="margin-top: 60px;">
    <footer style="text-align: center; color: #597367; font-size: 0.9em; padding: 20px 0;">
        <p><strong>AksesPangan - Platform Penyelamatan Surplus Pangan</strong></p>
        <p>Tim Bojongsantos Empire © 2024</p>
        <p>Dokumentasi dibuat dengan Kiro AI-Assisted Development</p>
        <p><a href="https://bojongsantos-empire.vercel.app">https://bojongsantos-empire.vercel.app</a></p>
    </footer>
</body>
</html>
`;

// Save HTML file
const htmlPath = path.join(__dirname, 'PROJECT_DOCUMENTATION.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('✅ File HTML berhasil dibuat: PROJECT_DOCUMENTATION.html');
console.log('\n📋 Untuk mengkonversi ke PDF, gunakan salah satu metode berikut:\n');
console.log('1. Buka PROJECT_DOCUMENTATION.html di browser, lalu Print → Save as PDF');
console.log('2. Gunakan online converter seperti:');
console.log('   - https://www.markdowntopdf.com/');
console.log('   - https://md2pdf.netlify.app/');
console.log('   - https://www.convertio.co/md-pdf/');
console.log('\n3. Atau install md-to-pdf:');
console.log('   npm install -g md-to-pdf');
console.log('   md-to-pdf PROJECT_DOCUMENTATION.md');
console.log('\n✨ File HTML siap untuk dikonversi!\n');
