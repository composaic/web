import { z, ZodSchema } from 'zod';
import { PropertyType } from '../types';

/**
 * Parses TypeScript-like syntax strings into Zod schemas for runtime validation
 */
export class TypeScriptSyntaxParser {
  /**
   * Parse a property type string into a Zod schema
   * @param typeString - TypeScript-like type string (e.g., 'string', '?number', 'admin|user|guest', 'string[]')
   * @returns Zod schema for validation
   */
  static parsePropertyType(typeString: PropertyType): ZodSchema {
    // Handle optional properties
    if (typeString.startsWith('?')) {
      const baseType = typeString.slice(1) as PropertyType;
      return this.parsePropertyType(baseType).optional();
    }

    // Handle union types
    if (typeString.includes('|')) {
      const unionTypes = typeString
        .split('|')
        .map((type: string) => type.trim());

      // Check if all union types are literals (strings without basic types)
      const isLiteralUnion = unionTypes.every(
        (type: string) =>
          !['string', 'number', 'boolean', 'object', 'array'].includes(type) &&
          !type.endsWith('[]'),
      );

      if (isLiteralUnion) {
        // Create literal union for string literals like 'admin|user|guest'
        return z.union([
          z.literal(unionTypes[0]),
          z.literal(unionTypes[1]),
          ...unionTypes.slice(2).map((type: string) => z.literal(type)),
        ] as [
          z.ZodLiteral<string>,
          z.ZodLiteral<string>,
          ...z.ZodLiteral<string>[],
        ]);
      } else {
        // Handle mixed type unions
        return z.union([
          this.parseBasicType(unionTypes[0]),
          this.parseBasicType(unionTypes[1]),
          ...unionTypes
            .slice(2)
            .map((type: string) => this.parseBasicType(type)),
        ] as [ZodSchema, ZodSchema, ...ZodSchema[]]);
      }
    }

    // Handle array types
    if (typeString.endsWith('[]')) {
      const elementType = typeString.slice(0, -2) as PropertyType;
      return z.array(this.parsePropertyType(elementType));
    }

    return this.parseBasicType(typeString);
  }

  /**
   * Parse basic type strings into Zod schemas
   * @param type - Basic type string
   * @returns Zod schema
   */
  private static parseBasicType(type: string): ZodSchema {
    switch (type.trim()) {
      case 'string':
        return z.string();
      case 'number':
        return z.number();
      case 'boolean':
        return z.boolean();
      case 'object':
        return z.object({}).passthrough(); // Allow any object structure
      case 'array':
        return z.array(z.unknown());
      default:
        // Handle literal types or unknown types
        return z.literal(type);
    }
  }

  /**
   * Validate a type string format
   * @param typeString - Type string to validate
   * @returns true if valid format
   */
  static isValidTypeString(typeString: string): boolean {
    try {
      this.parsePropertyType(typeString as PropertyType);
      return true;
    } catch {
      return false;
    }
  }
}
