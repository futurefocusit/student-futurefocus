'use client';

import React from 'react';

type FormattedDateProps = {
  date: string | Date;
};

const FormattedDate: React.FC<FormattedDateProps> = ({ date }) => {
  const parsedDate = new Date(date);
  const formatted = parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return <span>{formatted}</span>;
};

export default FormattedDate;
