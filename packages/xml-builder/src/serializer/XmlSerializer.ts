/**
 * Opzioni per la serializzazione XML
 */
export interface XmlSerializerOptions {
  /** Indentazione (default: 2 spazi) */
  indent?: number;
  /** Dichiarazione XML (default: true) */
  declaration?: boolean;
  /** Formato pretty print (default: true) */
  pretty?: boolean;
}

/**
 * Serializzatore XML leggero senza dipendenze esterne
 */
export class XmlSerializer {
  private indent: number;
  private declaration: boolean;
  private pretty: boolean;

  constructor(options: XmlSerializerOptions = {}) {
    this.indent = options.indent ?? 2;
    this.declaration = options.declaration ?? true;
    this.pretty = options.pretty ?? true;
  }

  /**
   * Serializza un oggetto in XML
   */
  serialize(rootName: string, obj: unknown, attributes?: Record<string, string>): string {
    const lines: string[] = [];

    if (this.declaration) {
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    }

    this.serializeElement(lines, rootName, obj, 0, attributes);

    return this.pretty ? lines.join('\n') : lines.join('');
  }

  /**
   * Serializza un elemento XML
   */
  private serializeElement(
    lines: string[],
    name: string,
    value: unknown,
    level: number,
    attributes?: Record<string, string>
  ): void {
    const indentStr = this.pretty ? ' '.repeat(level * this.indent) : '';
    const attrStr = attributes ? this.formatAttributes(attributes) : '';

    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const escaped = this.escapeXml(String(value));
      lines.push(`${indentStr}<${name}${attrStr}>${escaped}</${name}>`);
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        this.serializeElement(lines, name, item, level);
      }
      return;
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const hasChildren = Object.keys(obj).some((k) => obj[k] !== null && obj[k] !== undefined);

      if (!hasChildren) {
        return;
      }

      lines.push(`${indentStr}<${name}${attrStr}>`);

      for (const [key, childValue] of Object.entries(obj)) {
        if (childValue !== null && childValue !== undefined) {
          this.serializeElement(lines, this.toPascalCase(key), childValue, level + 1);
        }
      }

      lines.push(`${indentStr}</${name}>`);
    }
  }

  /**
   * Escape caratteri speciali XML
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Formatta gli attributi XML
   */
  private formatAttributes(attributes: Record<string, string>): string {
    const parts = Object.entries(attributes).map(
      ([key, value]) => `${key}="${this.escapeXml(value)}"`
    );
    return parts.length > 0 ? ' ' + parts.join(' ') : '';
  }

  /**
   * Converte una stringa da camelCase a PascalCase
   */
  private toPascalCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
