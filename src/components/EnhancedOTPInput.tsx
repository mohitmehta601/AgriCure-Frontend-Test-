import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EnhancedOTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const EnhancedOTPInput = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
  label = "Enter verification code",
  placeholder = "000000",
  autoFocus = true
}: EnhancedOTPInputProps) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    // Only allow digits
    const sanitizedValue = newValue.replace(/\D/g, '').slice(0, length);
    setInternalValue(sanitizedValue);
    onChange(sanitizedValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium text-center block">
          {label}
        </Label>
      )}
      <div className="flex justify-center">
        <InputOTP
          value={internalValue}
          onChange={handleChange}
          maxLength={length}
          disabled={disabled}
          autoFocus={autoFocus}
          className="gap-2"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length }, (_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={cn(
                  "w-12 h-12 text-lg font-mono border-2 rounded-lg",
                  "focus:border-grass-500 focus:ring-2 focus:ring-grass-200",
                  "transition-all duration-200",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Enter the {length}-digit code sent to your device
      </p>
    </div>
  );
};

export default EnhancedOTPInput;