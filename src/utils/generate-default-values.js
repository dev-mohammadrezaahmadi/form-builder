import { ELEMENT_TYPES } from 'src/types';

export function generateDefaultValues(node) {
    if (!node) return undefined;

    if (node.element_type?.type === ELEMENT_TYPES.SIMPLE_TYPE) {
        if (node.element_type.restriction?.base === 'dateTime') {
            return node.element_type.value || null;
        }
        if (node.element_type.restriction?.base === 'boolean') {
            return node.element_type.value !== "" && node.element_type.value !== undefined ? node.element_type.value : false;
        }
        return node.element_type.value !== undefined ? node.element_type.value : '';
    }

    if (node.element_type?.type === ELEMENT_TYPES.ELEMENT_SEQUENCE) {
        const children = node.element_type.children.flat();
        const shape = {};
        children.forEach((child) => {
            const val = generateDefaultValues(child);
            if (val !== undefined) {
                shape[child.name] = val;
            }
        });
        return shape;
    }

    if (node.element_type?.type === ELEMENT_TYPES.CHOICE) {
        const options = node.element_type.children.flat();
        const shape = {};
        const selectedIdx = node.element_type.selected_child_index || 0;
        if (options[selectedIdx]) {
            const val = generateDefaultValues(options[selectedIdx]);
            if (val !== undefined) {
                shape[options[selectedIdx].name] = val;
            }
        }
        return shape;
    }

    return undefined;
}
