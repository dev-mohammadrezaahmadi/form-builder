import { useEffect, useMemo, useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Form } from 'src/components/hook-form';

export default function DashboardView() {
  const methods = useForm();

  const { handleSubmit } = methods;

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <>
      <Typography variant="h3" textAlign="center">
        Welcome to RUNC!
      </Typography>
      <p>hello world</p>
      <Form methods={methods} onSubmit={onSubmit}>
        {/*
      import Field component from src/components/hook-form
      and use them based on the json file you were given :
      <Filed.Text ...hook form props />
      */}
      </Form>
    </>
  );
}
