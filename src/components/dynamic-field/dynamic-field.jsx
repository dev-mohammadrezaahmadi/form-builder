import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';


import { ELEMENT_TYPES } from 'src/types'


import { Field } from 'src/components/hook-form';

export function DynamicField({ node, path = '' }) {
    const { element_type, name } = node;
    const currentPath = path ? `${path}.${name}` : name;

    // 1. Simple Types
    if (element_type.type === ELEMENT_TYPES.SIMPLE_TYPE) {
        return <SimpleField node={node} path={currentPath} />;
    }

    // 2. Element Sequence (Groups)
    if (element_type.type === ELEMENT_TYPES.ELEMENT_SEQUENCE) {
        return <SequenceField node={node} path={currentPath} />;
    }


    // 3. Choice (Branching)
    if (element_type.type === ELEMENT_TYPES.CHOICE) {
        return <ChoiceField node={node} path={currentPath} />;
    }

    return null;
}

// --------------------------------------------------------------------------------------------------------------------


export function SimpleField({ node, path }) {
    const { element_type, name, verbose_name, description, min } = node;
    const { restriction } = element_type;

    const isRequired = parseInt(min, 10) > 0;
    const labelText = isRequired ? `${verbose_name || name} *` : (verbose_name || name);

    const tooltipAdornment = description ? (
        <InputAdornment position="end">
            <QuestionMarkTooltip description={description} />
        </InputAdornment>
    ) : null;

    if (restriction?.restriction_type === 'enum_restriction') {
        return (
            <Field.Select
                name={path}
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
                name={path}
                label={labelText}
            />
        );
    }

    if (restriction?.base === 'boolean') {
        return <Field.Switch name={path} label={labelText} helperText={description} />;
    }

    return (
        <Field.Text
            name={path}
            label={labelText}
            InputProps={{ endAdornment: tooltipAdornment }}
        />
    );
}

export function SequenceField({ node, path }) {
    const { element_type, name, verbose_name, description, min } = node;
    const children = element_type.children.flat();
    const isRequired = parseInt(min, 10) > 0;
    const [isEnabled, setIsEnabled] = useState(isRequired);

    return (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: '#f5f5f5ff' }}>
            <Stack direction="row" alignItems="center" spacing={1} padding={1.5}>
                {!isRequired && (
                    <Checkbox
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        color="success"
                        size="small"
                    />
                )}
                <Typography fontWeight='bold'>
                    {verbose_name || name}
                </Typography>
                {description && <QuestionMarkTooltip description={description} />}
            </Stack>

            {isEnabled && (
                <Stack spacing={2} padding={2}>
                    {children.map((child) => (
                        <DynamicField key={child.name} node={child} path={path} />
                    ))}
                </Stack>
            )}
        </Card>
    );
}

export function ChoiceField({ node, path }) {
    const { element_type, name, verbose_name, description, min } = node;
    const options = element_type.children.flat();
    const [selectedIdx, setSelectedIdx] = useState(element_type.selected_child_index || 0);

    const isRequired = parseInt(min, 10) > 0;
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
                <Typography fontWeight='bold'>
                    {verbose_name || name}
                </Typography>
                {description && <QuestionMarkTooltip description={description} />}
            </Stack>

            {isEnabled && (
                <Card sx={{ p: 2, bgcolor: '#eeeeeeff', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                    <Select
                        fullWidth
                        size="small"
                        value={selectedIdx}
                        onChange={(e) => setSelectedIdx(e.target.value)}
                        sx={{ mb: 2, bgcolor: 'white' }}
                    >
                        {options.map((opt, idx) => (
                            <MenuItem key={opt.name} value={idx}>{opt.verbose_name || opt.name}</MenuItem>
                        ))}
                    </Select>

                    <DynamicField node={options[selectedIdx]} path={path} />
                </Card>
            )}
        </Box>
    );
}

function QuestionMarkTooltip({ description }) {
    return <Tooltip title={description} placement="top">
        ❔
    </Tooltip>
}
