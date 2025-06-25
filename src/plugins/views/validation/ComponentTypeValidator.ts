import { z, ZodSchema } from 'zod';
import { ComponentProperties, ValidationResult } from '../types';
import { TypeScriptSyntaxParser } from './TypeScriptSyntaxParser';

/**
 * Validates component properties using Zod schemas generated from TypeScript-like syntax
 */
export class ComponentTypeValidator {
  /**
   * Validate component props against property definitions
   * @param properties - Component property definitions
   * @param props - Actual props to validate
   * @returns Validation result with success/error information
   */
  validate(properties: ComponentProperties, props: any): ValidationResult {
    try {
      const schema = this.generateZodSchema(properties);
      const validatedProps = schema.parse(props);
      
      return { 
        success: true, 
        data: validatedProps 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        return { 
          success: false, 
          error: `Validation failed: ${errorMessages.join('; ')}` 
        };
      }
      
      return { 
        success: false, 
        error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Generate a Zod schema from component property definitions
   * @param properties - Component property definitions
   * @returns Zod object schema
   */
  private generateZodSchema(properties: ComponentProperties): ZodSchema {
    const schemaObject: Record<string, ZodSchema> = {};

    for (const [key, typeString] of Object.entries(properties)) {
      try {
        schemaObject[key] = TypeScriptSyntaxParser.parsePropertyType(typeString);
      } catch (error) {
        console.warn(`[ComponentTypeValidator] Failed to parse type for property ${key}: ${typeString}`, error);
        // Fallback to unknown type
        schemaObject[key] = z.unknown();
      }
    }

    return z.object(schemaObject);
  }

  /**
   * Validate property definitions format
   * @param properties - Property definitions to validate
   * @returns Array of validation errors (empty if valid)
   */
  validatePropertyDefinitions(properties: ComponentProperties): string[] {
    const errors: string[] = [];

    for (const [key, typeString] of Object.entries(properties)) {
      if (!TypeScriptSyntaxParser.isValidTypeString(typeString)) {
        errors.push(`Invalid type definition for property ${key}: ${typeString}`);
      }
    }

    return errors;
  }
}
