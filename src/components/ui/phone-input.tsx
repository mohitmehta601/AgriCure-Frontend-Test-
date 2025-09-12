import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Country codes data
const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryCodeChange?: (countryCode: string) => void;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  defaultCountryCode?: string;
  id?: string;
  "aria-describedby"?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder = "XXXXXXXXXX",
  disabled = false,
  error = false,
  className,
  label,
  required = false,
  defaultCountryCode = "+91",
  id,
  "aria-describedby": ariaDescribedBy,
}: PhoneInputProps) {
  // Parse the value to extract country code and phone number
  const parsePhoneNumber = (phoneValue: string) => {
    if (!phoneValue)
      return { countryCode: defaultCountryCode, phoneNumber: "" };

    // Find matching country code
    const matchingCountry = COUNTRY_CODES.find((country) =>
      phoneValue.startsWith(country.code)
    );

    if (matchingCountry) {
      return {
        countryCode: matchingCountry.code,
        phoneNumber: phoneValue.substring(matchingCountry.code.length).trim(),
      };
    }

    // If no country code found, assume default
    return {
      countryCode: defaultCountryCode,
      phoneNumber: phoneValue.startsWith("+")
        ? phoneValue.substring(1)
        : phoneValue,
    };
  };

  const [countryCode, setCountryCode] = useState(
    () => parsePhoneNumber(value).countryCode
  );
  const [phoneNumber, setPhoneNumber] = useState(
    () => parsePhoneNumber(value).phoneNumber
  );

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const parsed = parsePhoneNumber(value);
      setCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.phoneNumber);
    }
  }, [value, defaultCountryCode]);

  const handleCountryCodeChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const fullNumber = newCountryCode + phoneNumber;
    onChange?.(fullNumber);
    onCountryCodeChange?.(newCountryCode);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/[^\d]/g, ""); // Only allow digits
    setPhoneNumber(newPhoneNumber);
    const fullNumber = countryCode + newPhoneNumber;
    onChange?.(fullNumber);
    onPhoneNumberChange?.(newPhoneNumber);
  };

  const selectedCountry = COUNTRY_CODES.find(
    (country) => country.code === countryCode
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-sm md:text-base font-medium text-gray-700"
        >
          {label} {required && "*"}
        </Label>
      )}
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="w-24 md:w-28">
          <Select
            value={countryCode}
            onValueChange={handleCountryCodeChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "h-11 md:h-12 text-sm md:text-base transition-all duration-200",
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-grass-500 focus:ring-grass-500"
              )}
            >
              <SelectValue>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">{selectedCountry?.flag}</span>
                  <span className="text-xs md:text-sm">{countryCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center space-x-2 py-1">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-medium">{country.code}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {country.name}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <Input
            id={id}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "h-11 md:h-12 text-sm md:text-base transition-all duration-200",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-grass-500 focus:ring-grass-500"
            )}
            aria-describedby={ariaDescribedBy}
          />
        </div>
      </div>
    </div>
  );
}

export default PhoneInput;
