"use client";

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Page() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <Button variant="outline" onClick={handleSendEmail} isLoading={loading}>Send Email</Button>
    </div>
  )
}
