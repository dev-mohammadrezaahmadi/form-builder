import { ELEMENT_TYPES } from 'src/types';

export function fillSchemaWithData(originalSchema, formData) {
  const schema = structuredClone(originalSchema);

  if (getRootNode(schema)) {
    traverseAndReplace(getRootNode(schema), formData);
  }

  return schema;
}

// ----------------------------------------------------------------------

export function getRootNode(schema) {
  return schema?.appHdr?.element;
}

function traverseAndReplace(node, data) {
  if (!node) return;

  if (node.element_type?.type === ELEMENT_TYPES.SIMPLE_TYPE) {
    if (data && data[node.name] !== undefined) {
      node.element_type.value = data[node.name];
    }
  } else if (node.element_type?.type === ELEMENT_TYPES.ELEMENT_SEQUENCE) {
    const children = node.element_type.children.flat();
    const nodeData = data ? data[node.name] : undefined;

    children.forEach((child) => {
      traverseAndReplace(child, nodeData);
    });
  } else if (node.element_type?.type === ELEMENT_TYPES.CHOICE) {
    const options = node.element_type.children.flat();
    const nodeData = data ? data[node.name] : undefined;

    let selectedIdx = node.element_type.selected_child_index || 0;

    if (nodeData) {
      options.forEach((child, idx) => {
        if (nodeData[child.name] !== undefined) {
          selectedIdx = idx;
        }
        traverseAndReplace(child, nodeData);
      });
    }

    node.element_type.selected_child_index = selectedIdx;
  }
}
