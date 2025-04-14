import React, { useState, useEffect } from 'react';

const CountUp = ({ endValue }) => {
  const [count, setCount] = useState(0);

  const formatPeso = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  useEffect(() => {
    let startTime = 0;
    const duration = 2000; 
    const step = 10; 

    const interval = setInterval(() => {
      startTime += step;

      const currentCount = Math.min(
        Math.round((startTime / duration) * endValue), 
        endValue
      );
      setCount(currentCount);

      if (currentCount === endValue) {
        clearInterval(interval); 
      }
    }, step);

    return () => clearInterval(interval); 
  }, [endValue]);

  return <div>{formatPeso(count)}</div>;
};

export default CountUp;
