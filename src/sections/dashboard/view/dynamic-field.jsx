import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { Field } from 'src/components/hook-form';

export function DynamicField({ field, path = '' }) {
  const { element_type, name, verbose_name, description } = field;
  const currentPath = path ? `${path}.${name}` : name;

  // 1. Simple Input Fields
  if (element_type.type === 'simple_type') {
    return <SimpleField field={field} currentPath={currentPath} />;
  }

  // 2. Nested Fields
  if (element_type.type === 'element_sequence') {
    return <SequenceField field={field} currentPath={currentPath} />;
  }


  // 3. Selective Fields
  if (element_type.type === 'choice') {
    return <ChoiceField field={field} currentPath={currentPath} />;
  }

  return null;
}

function ChoiceField({ field, currentPath }) {
  const { element_type, name, verbose_name } = field;
  const options = element_type.children.flat();
  const [selectedIdx, setSelectedIdx] = useState(element_type.selected_child_index || 0);

  return (
    <Card sx={{ p: 2, mb: 1.5, border: '1px dashed', borderColor: 'primary.main', boxShadow: 'none' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Option: {verbose_name || name}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {options.map((opt, idx) => (
            <Button
              key={opt.name}
              variant={selectedIdx === idx ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedIdx(idx)}
            >
              {opt.verbose_name || opt.name}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <DynamicField field={options[selectedIdx]} path={currentPath} />
      </Box>
    </Card>
  );
}

function SimpleField({ field, currentPath }) {
  const { element_type, name, verbose_name, description } = field;
  const { restriction } = element_type;

  if (restriction?.restriction_type === 'enum_restriction') {
    return (
      <Field.Select name={currentPath} label={verbose_name || name} helperText={description}>
        <MenuItem value="">None</MenuItem>
        {restriction.children.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Field.Select>
    );
  }

  if (restriction?.base === 'dateTime') {
    return <Field.DatePicker name={currentPath} label={verbose_name || name} helperText={description} />;
  }

  if (restriction?.base === 'boolean') {
    return <Field.Switch name={currentPath} label={verbose_name || name} helperText={description} />;
  }

  return <Field.Text name={currentPath} label={verbose_name || name} helperText={description} />;
}

function SequenceField({ field, currentPath }) {
  const { element_type, name, verbose_name, description } = field;
  const allChildren = element_type.children.flat();

  return (
    <Card sx={{ p: 2, mb: 1.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'fontWeightBold' }}>
        {verbose_name || name}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {description}
        </Typography>
      )}
      <Stack spacing={2.5} sx={{ mt: 2 }}>
        {allChildren.map((childField) => (
          <DynamicField key={childField.name} field={childField} path={currentPath} />
        ))}
      </Stack>
    </Card>
  );
}

