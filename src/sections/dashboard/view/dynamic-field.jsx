import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Icon } from '@iconify/react';

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
  const { element_type, name, verbose_name, description, min } = field;
  const options = element_type.children.flat();
  const [selectedIdx, setSelectedIdx] = useState(element_type.selected_child_index || 0);

  const isRequired = Number(min) > 0;
  const [isEnabled, setIsEnabled] = useState(isRequired);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        {!isRequired && (
          <Checkbox 
            checked={isEnabled} 
            onChange={(e) => setIsEnabled(e.target.checked)} 
            color="success" 
            size="small" 
          />
        )}
        <Typography variant="subtitle2" sx={{ fontWeight: 'fontWeightBold' }}>
          {verbose_name || name}
        </Typography>
        {description && (
          <Tooltip title={description} placement="top">
            <IconButton size="small">
              <Icon icon="eva:question-mark-circle-fill" width={18} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {isEnabled && (
        <Card sx={{ p: 2, bgcolor: '#f4f6f8', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
           <Select 
             fullWidth 
             size="small" 
             value={selectedIdx} 
             onChange={(e) => setSelectedIdx(e.target.value)}
             sx={{ mb: 2, bgcolor: 'background.paper' }}
           >
             {options.map((opt, idx) => (
                <MenuItem key={opt.name} value={idx}>{opt.verbose_name || opt.name}</MenuItem>
             ))}
           </Select>

           <DynamicField field={options[selectedIdx]} path={currentPath} />
        </Card>
      )}
    </Box>
  );
}

function SimpleField({ field, currentPath }) {
  const { element_type, name, verbose_name, description, min } = field;
  const { restriction } = element_type;
  
  const isRequired = Number(min) > 0;
  const labelText = isRequired ? `${verbose_name || name} *` : (verbose_name || name);

  const tooltipAdornment = description ? (
    <InputAdornment position="end">
      <Tooltip title={description} placement="top">
        <Icon icon="eva:question-mark-circle-fill" width={18} />
      </Tooltip>
    </InputAdornment>
  ) : null;

  if (restriction?.restriction_type === 'enum_restriction') {
    return (
      <Field.Select 
        name={currentPath} 
        label={labelText} 
        InputProps={{ endAdornment: tooltipAdornment }}
      >
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
    return (
      <Field.DatePicker 
         name={currentPath} 
         label={labelText} 
      />
    );
  }

  if (restriction?.base === 'boolean') {
    return <Field.Switch name={currentPath} label={labelText} helperText={description} />;
  }

  return (
    <Field.Text 
       name={currentPath} 
       label={labelText} 
       InputProps={{ endAdornment: tooltipAdornment }}
    />
  );
}

function SequenceField({ field, currentPath }) {
  const { element_type, name, verbose_name, description, min } = field;
  const allChildren = element_type.children.flat();
  const isRequired = Number(min) > 0;
  const [isEnabled, setIsEnabled] = useState(isRequired);

  return (
    <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: '#f4f6f8' }}>
      <Stack direction="row" alignItems="center" sx={{ p: 1.5, pb: isEnabled ? 0 : 1.5 }}>
        {!isRequired && (
          <Checkbox 
            checked={isEnabled} 
            onChange={(e) => setIsEnabled(e.target.checked)} 
            color="success" 
            size="small" 
          />
        )}
        <Typography variant="subtitle2" sx={{ fontWeight: 'fontWeightBold' }}>
          {verbose_name || name}
        </Typography>
        {description && (
          <Tooltip title={description} placement="top">
            <IconButton size="small" sx={{ ml: 0.5 }}>
              <Icon icon="eva:question-mark-circle-fill" width={18} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {isEnabled && (
        <Stack spacing={2} sx={{ p: 2 }}>
          {allChildren.map((childField) => (
            <DynamicField key={childField.name} field={childField} path={currentPath} />
          ))}
        </Stack>
      )}
    </Card>
  );
}

