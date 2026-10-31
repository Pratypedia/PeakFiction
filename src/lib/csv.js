// RFC 4180-style CSV parser: handles quoted fields, escaped quotes ("")
// and newlines inside quoted cells (multi-line comments in the sheet).
export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, ''); // Excel adds a BOM to "CSV UTF-8" files
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field.trim());
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rows.filter(r => r.some(cell => cell.length > 0));
}

/** Parse CSV into objects keyed by header row. */
export function parseCSVObjects(text) {
  const [headers = [], ...rows] = parseCSV(text);
  return rows.map(cells => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ''])));
}
