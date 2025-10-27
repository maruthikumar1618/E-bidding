import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  onComplete?: () => void;
}

const CountdownTimer = ({ endTime, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0 && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 text-destructive font-semibold">
        <Clock className="h-5 w-5" />
        <span>Auction Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Clock className="h-5 w-5 text-primary" />
      <div className="flex gap-2">
        {days > 0 && (
          <TimeUnit value={days} label="days" />
        )}
        <TimeUnit value={hours} label="hrs" />
        <TimeUnit value={minutes} label="min" />
        <TimeUnit value={seconds} label="sec" />
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center min-w-[60px] p-2 rounded-lg bg-gradient-card border">
    <span className="text-2xl font-bold text-primary tabular-nums">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs text-muted-foreground uppercase">{label}</span>
  </div>
);

export default CountdownTimer;
