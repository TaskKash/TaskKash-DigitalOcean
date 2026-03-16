import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function VideoTask() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect all traffic from this dead page to the unified /tasks list
    setLocation('/tasks');
  }, [setLocation]);

  return null;
}

