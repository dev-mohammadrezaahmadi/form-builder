import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { generateZodSchema } from 'src/utils/generate-zod-schema';
import { getRootNode, fillSchemaWithData } from 'src/utils/fill-schema';
import { generateDefaultValues } from 'src/utils/generate-default-values';

import { Form } from 'src/components/hook-form';
import { DynamicField } from 'src/components/dynamic-field';

export default function DashboardView() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const zodSchema = useMemo(() => {
    const rootNode = getRootNode(schema);
    if (!rootNode) return z.any();
    return z.object({
      [rootNode.name]: generateZodSchema(rootNode),
    });
  }, [schema]);

  const defaultValues = useMemo(() => {
    const rootNode = getRootNode(schema);
    if (!rootNode) return {};
    return {
      [rootNode.name]: generateDefaultValues(rootNode),
    };
  }, [schema]);

  const methods = useForm({
    resolver: zodResolver(zodSchema),
    shouldUnregister: true,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (schema) {
      reset(defaultValues);
    }
  }, [schema, defaultValues, reset]);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await fetch('/data.json');
        const data = await response.json();
        setSchema(data);
      } catch (error) {
        console.error('Failed to load schema', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  const onSubmit = handleSubmit((data) => {
    const finalSchema = fillSchemaWithData(schema, data);
    console.log('Form Data!', data);
    console.log('Form Submitted!', finalSchema);
  });

  return (
    <Box sx={{ mx: 'auto', p: 3 }}>
      <Typography variant="h4" textAlign="center" sx={{ mb: 5 }}>
        RUNC
      </Typography>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            {schema?.appHdr?.element ? (
              <DynamicField node={schema.appHdr.element} path="" />
            ) : (
              <Typography color="error">Failed to load the form schema.</Typography>
            )}

            <Button type="submit" variant="contained" color="primary" size="large">
              Submit
            </Button>
          </Stack>
        </Form>
      )}
    </Box>
  );
}
