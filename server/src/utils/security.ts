export function sanitizeFilter(value: any): any {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeFilter);
  if (typeof value === 'object') {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeFilter(val);
    }
    return sanitized;
  }
  return value;
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
