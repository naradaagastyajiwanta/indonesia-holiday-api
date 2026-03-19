import { useState, useEffect } from 'react';
import { IndonesiaHoliday, Holiday } from './indonesiaHoliday';

export function useHolidays(year?: number, month?: string) {
  const [data, setData] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    IndonesiaHoliday.getHolidays(year, month)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [year, month]);

  return { data, isLoading, error };
}

export function useTodayHoliday() {
  const [data, setData] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    IndonesiaHoliday.today()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return { data, isLoading, error };
}

export function useNextHoliday() {
  const [data, setData] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    IndonesiaHoliday.next()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return { data, isLoading, error };
}
