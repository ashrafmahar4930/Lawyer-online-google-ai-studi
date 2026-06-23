import fs from 'fs';
import path from 'path';

const replaceKhata = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.next') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceKhata(filePath);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.json') || filePath.endsWith('.rules')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      const newContent = content
        .replace(/khata/g, 'ledger')
        .replace(/Khata/g, 'Ledger')
        .replace(/KHATA/g, 'LEDGER');

      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
    }
  }
};

replaceKhata('.');
