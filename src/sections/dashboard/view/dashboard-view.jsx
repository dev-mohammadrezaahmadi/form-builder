import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Form } from 'src/components/hook-form';

export default function DashboardView() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  const methods = useForm();

  const { handleSubmit } = methods;

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
    console.log('Form Submitted!', data);
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" textAlign="center" sx={{ mb: 5 }}>
        Business Application Header Form
      </Typography>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 400 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Submit Header
            </Button>
          </Stack>
        </Form>
      )}
    </Box>
  );
}
