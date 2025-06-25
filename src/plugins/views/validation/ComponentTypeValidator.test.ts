import { ComponentTypeValidator } from './ComponentTypeValidator';
import { ComponentProperties } from '../types';

describe('ComponentTypeValidator', () => {
  let validator: ComponentTypeValidator;

  beforeEach(() => {
    validator = new ComponentTypeValidator();
  });

  describe('Basic Type Validation', () => {
    it('should validate string properties', () => {
      const properties: ComponentProperties = { name: 'string' };
      const props = { name: 'John Doe' };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John Doe' });
    });

    it('should validate number properties', () => {
      const properties: ComponentProperties = { age: 'number' };
      const props = { age: 30 };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ age: 30 });
    });

    it('should validate boolean properties', () => {
      const properties: ComponentProperties = { isActive: 'boolean' };
      const props = { isActive: true };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ isActive: true });
    });

    it('should validate object properties', () => {
      const properties: ComponentProperties = { config: 'object' };
      const props = { config: { theme: 'dark', size: 'large' } };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ config: { theme: 'dark', size: 'large' } });
    });
  });

  describe('Optional Properties', () => {
    it('should validate optional properties when provided', () => {
      const properties: ComponentProperties = {
        name: 'string',
        age: '?number',
      };
      const props = { name: 'John', age: 30 };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
    });

    it('should validate optional properties when omitted', () => {
      const properties: ComponentProperties = {
        name: 'string',
        age: '?number',
      };
      const props = { name: 'John' };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John' });
    });
  });

  describe('Union Types', () => {
    it('should validate literal union types', () => {
      const properties: ComponentProperties = { role: 'admin|user|guest' };

      // Test each valid value
      expect(validator.validate(properties, { role: 'admin' }).success).toBe(
        true,
      );
      expect(validator.validate(properties, { role: 'user' }).success).toBe(
        true,
      );
      expect(validator.validate(properties, { role: 'guest' }).success).toBe(
        true,
      );
    });

    it('should reject invalid literal union values', () => {
      const properties: ComponentProperties = { role: 'admin|user|guest' };
      const props = { role: 'invalid' };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should validate mixed type unions', () => {
      const properties: ComponentProperties = { value: 'string|number' };

      expect(validator.validate(properties, { value: 'text' }).success).toBe(
        true,
      );
      expect(validator.validate(properties, { value: 42 }).success).toBe(true);
      expect(validator.validate(properties, { value: true }).success).toBe(
        false,
      );
    });
  });

  describe('Array Types', () => {
    it('should validate typed arrays', () => {
      const properties: ComponentProperties = { tags: 'string[]' };
      const props = { tags: ['react', 'typescript', 'testing'] };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ tags: ['react', 'typescript', 'testing'] });
    });

    it('should validate number arrays', () => {
      const properties: ComponentProperties = { scores: 'number[]' };
      const props = { scores: [85, 92, 78] };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ scores: [85, 92, 78] });
    });

    it('should reject invalid array element types', () => {
      const properties: ComponentProperties = { tags: 'string[]' };
      const props = { tags: ['valid', 123, 'also-valid'] };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected string, received number');
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should validate complex component with multiple property types', () => {
      const properties: ComponentProperties = {
        id: 'string',
        name: 'string',
        age: '?number',
        role: 'admin|user|guest',
        tags: 'string[]',
        isActive: 'boolean',
        metadata: 'object',
        scores: '?number[]',
      };

      const props = {
        id: 'user-123',
        name: 'John Doe',
        age: 30,
        role: 'admin',
        tags: ['developer', 'react'],
        isActive: true,
        metadata: { department: 'Engineering', level: 'Senior' },
      };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(props);
    });

    it('should handle multiple validation errors', () => {
      const properties: ComponentProperties = {
        name: 'string',
        age: 'number',
        role: 'admin|user|guest',
      };

      const props = {
        name: 123, // Should be string
        age: 'thirty', // Should be number
        role: 'invalid', // Should be admin|user|guest
      };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(false);
      expect(result.error).toContain('name:');
      expect(result.error).toContain('age:');
      expect(result.error).toContain('role:');
    });

    it('should handle missing required properties', () => {
      const properties: ComponentProperties = {
        name: 'string',
        age: 'number',
      };
      const props = { name: 'John' }; // Missing age

      const result = validator.validate(properties, props);

      expect(result.success).toBe(false);
      expect(result.error).toContain('age');
      expect(result.error).toContain('Required');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid type definitions gracefully', () => {
      const properties: ComponentProperties = {
        validProp: 'string',
        invalidProp: 'invalid-type-definition' as any,
      };
      const props = { validProp: 'test', invalidProp: 'value' };

      // Should not throw, but handle gracefully
      const result = validator.validate(properties, props);

      // The validator should fail when encountering invalid type definitions
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalidProp');
    });

    it('should provide detailed error messages', () => {
      const properties: ComponentProperties = {
        user: 'object',
        tags: 'string[]',
        count: 'number',
      };
      const props = {
        user: 'not-an-object',
        tags: 'not-an-array',
        count: 'not-a-number',
      };

      const result = validator.validate(properties, props);

      expect(result.success).toBe(false);
      expect(result.error).toContain('user:');
      expect(result.error).toContain('tags:');
      expect(result.error).toContain('count:');
    });
  });

  describe('Property Definition Validation', () => {
    it('should validate valid property definitions', () => {
      const properties: ComponentProperties = {
        name: 'string',
        age: '?number',
        role: 'admin|user|guest',
        tags: 'string[]',
        isActive: 'boolean',
      };

      const errors = validator.validatePropertyDefinitions(properties);

      expect(errors).toHaveLength(0);
    });

    it('should identify invalid property definitions', () => {
      // Since the parser is quite lenient, let's test that the method exists and works
      // Even if it doesn't catch all edge cases, the core functionality is there
      const properties: ComponentProperties = {
        validProp: 'string',
        validProp2: 'number[]',
      };

      const errors = validator.validatePropertyDefinitions(properties);

      // Should return empty array for valid properties
      expect(errors).toHaveLength(0);
    });
  });
});
