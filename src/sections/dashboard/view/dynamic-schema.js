import { z } from 'zod';

export function generateZodSchema(field) {
  const { element_type, min, verbose_name } = field;
  const isRequired = parseInt(min, 10) > 0;
  const requiredMsg = `${verbose_name || field.name} is required`;

  let schemaPart = null;

  // 1. Simple Types
  if (element_type.type === 'simple_type') {
    const { restriction } = element_type;

    if (restriction?.restriction_type === 'enum_restriction') {
      const options = restriction.children || [];
      if (options.length > 0) {
        // Enforce the string is exactly one of the options
        schemaPart = z.string().refine((val) => options.includes(val), {
          message: `Must be one of: ${options.join(', ')}`,
        });
      } else {
        schemaPart = z.string();
      }
    } else if (restriction?.base === 'string') {
      schemaPart = z.string();
      
      if (restriction.minLength) {
        schemaPart = schemaPart.min(parseInt(restriction.minLength, 10), {
          message: `Minimum ${restriction.minLength} characters required`,
        });
      }
      if (restriction.maxLength) {
        schemaPart = schemaPart.max(parseInt(restriction.maxLength, 10), {
          message: `Maximum ${restriction.maxLength} characters allowed`,
        });
      }
      if (restriction.pattern) {
        try {
          schemaPart = schemaPart.regex(new RegExp(restriction.pattern), {
            message: 'Invalid format',
          });
        } catch (e) {
          // Fallback if regex compilation fails
        }
      }
    } else if (restriction?.base === 'boolean') {
      schemaPart = z.boolean();
    } else if (restriction?.base === 'dateTime') {
      // Date Pickers often return string or Date object. 
      // We accept both, but fallback to any to prevent zod crashes on complex objects.
      schemaPart = z.any();
    } else {
      schemaPart = z.any();
    }

    // Require min length > 0 if required and empty string isn't allowed
    if (isRequired && restriction?.base !== 'boolean') {
      // If it's a string, ensure it's not empty when required
      if (schemaPart instanceof z.ZodString) {
          schemaPart = schemaPart.min(1, { message: requiredMsg });
      }
    } else if (!isRequired) {
      // If optional, allow undefined or empty string or null
      schemaPart = schemaPart.optional().or(z.literal(''));
    }
  }

  // 2. Element Sequence (Groups)
  if (element_type.type === 'element_sequence') {
    const allChildren = element_type.children.flat();
    const shape = {};
    allChildren.forEach((child) => {
      shape[child.name] = generateZodSchema(child);
    });
    schemaPart = z.object(shape);
    if (!isRequired) {
      schemaPart = schemaPart.optional();
    }
  }

  // 3. Choice (Branching)
  if (element_type.type === 'choice') {
    const options = element_type.children.flat();
    const shape = {};
    // Because choice UI only mounts/shows one branch and we want to validate the visible one
    // strict discriminated union is complex. Let's make all choice paths optional at the base zod level
    // so it doesn't block submission. UI will enforce picking one.
    options.forEach((child) => {
      shape[child.name] = generateZodSchema(child).optional();
    });
    schemaPart = z.object(shape);
  }

  return schemaPart || z.any();
}
