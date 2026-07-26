import { useState, useEffect, useCallback } from "react";

export function useServerTime() {
  const [timeOffset, setTimeOffset] = useState<number>(0);

  useEffect(() => {
    const loadTime = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`);
        const apiData = await res.json();
        const serverTime = new Date(apiData.datetime).getTime();
        const localTime = new Date().getTime();
        setTimeOffset(serverTime - localTime);
      } catch (error) {
        // Silent fallback to local device time if API fails
      }
    };
    loadTime();
  }, []);

  const getServerTime = useCallback(() => new Date().getTime() + timeOffset, [timeOffset]);
  const getServerDate = useCallback(() => new Date(new Date().getTime() + timeOffset), [timeOffset]);

  return {
    timeOffset,
    getServerTime,
    getServerDate
  };
}
