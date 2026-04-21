import { z } from 'zod';
import { ELEMENT_TYPES } from 'src/types'

export function generateZodSchema(node) {
    const { element_type, min, verbose_name } = node;
    const isRequired = parseInt(min, 10) > 0;
    const requiredMsg = `${verbose_name || node.name} is required`;

    let schema = null;

    // 1. Simple Types
    if (element_type.type === ELEMENT_TYPES.SIMPLE_TYPE) {
        const { restriction } = element_type;

        if (restriction?.restriction_type === 'enum_restriction') {
            const options = restriction.children || [];
            if (options.length > 0) {
                // at least one option should be selected
                schema = z.string().refine((val) => options.includes(val), {
                    message: `Must be one of: ${options.join(', ')}`,
                });
            } else {
                schema = z.string();
            }
        } else if (restriction?.base === 'string') {
            schema = z.string();

            if (restriction.minLength) {
                schema = schema.min(parseInt(restriction.minLength, 10), {
                    message: `Minimum ${restriction.minLength} characters required`,
                });
            }
            if (restriction.maxLength) {
                schema = schema.max(parseInt(restriction.maxLength, 10), {
                    message: `Maximum ${restriction.maxLength} characters allowed`,
                });
            }
            if (restriction.pattern) {
                try {
                    schema = schema.regex(new RegExp(restriction.pattern), {
                        message: 'Invalid format',
                    });
                } catch (e) {
                    throw Error('Could not validate the regext format')
                }
            }
        } else if (restriction?.base === 'boolean') {
            schema = z.boolean();
        } else if (restriction?.base === 'dateTime') {
            schema = z.any();
        } else {
            schema = z.any();
        }

        if (isRequired && restriction?.base !== 'boolean') {
            if (restriction?.base === 'dateTime') {
                schema = z.any().refine((val) => val !== null && val !== undefined && val !== '', {
                    message: requiredMsg,
                });
            } else if (schema instanceof z.ZodString) {
                schema = schema.min(1, { message: requiredMsg });
            }
        } else if (!isRequired) {
            schema = schema.optional().or(z.literal('')).or(z.null());
        }
    }

    // 2. Element Sequence (Groups)
    if (element_type.type === ELEMENT_TYPES.ELEMENT_SEQUENCE) {
        const children = element_type.children.flat();
        const shape = {};
        children.forEach((child) => {
            shape[child.name] = generateZodSchema(child);
        });
        schema = z.object(shape);
        if (!isRequired) {
            schema = schema.optional();
        }
    }

    // 3. Choice (Branching)
    if (element_type.type === ELEMENT_TYPES.CHOICE) {
        const options = element_type.children.flat();
        const shape = {};
        // since branching choices are optional then validation of them will be optional too
        options.forEach((child) => {
            shape[child.name] = generateZodSchema(child).optional();
        });
        schema = z.object(shape);
    }

    return schema || z.any();
}
