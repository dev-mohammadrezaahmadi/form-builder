export function fillSchemaWithData(originalSchema, formData) {
  // Deep clone the original schema to avoid mutating the state
  const schema = JSON.parse(JSON.stringify(originalSchema));

  function walk(node, data) {
    if (!node) return;

    if (node.element_type?.type === 'simple_type') {
      if (data && data[node.name] !== undefined) {
        node.element_type.value = data[node.name];
      }
    } 
    else if (node.element_type?.type === 'element_sequence') {
      const children = node.element_type.children.flat();
      const nodeData = data ? data[node.name] : undefined;
      
      children.forEach((child) => {
        walk(child, nodeData);
      });
    } 
    else if (node.element_type?.type === 'choice') {
      const options = node.element_type.children.flat();
      const nodeData = data ? data[node.name] : undefined;
      
      let selectedIdx = node.element_type.selected_child_index || 0;
      
      if (nodeData) {
        options.forEach((child, idx) => {
          // If the RHF data object contains the key for this choice branch, it is the selected one!
          if (nodeData[child.name] !== undefined) {
            selectedIdx = idx;
          }
          walk(child, nodeData); 
        });
      }
      
      // Update the active choice index in the schema payload
      node.element_type.selected_child_index = selectedIdx;
    }
  }

  if (schema?.appHdr?.element) {
    // The root of the formData represents the global object containing AppHdr
    walk(schema.appHdr.element, formData);
  }

  return schema;
}
