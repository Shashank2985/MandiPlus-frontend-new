import { SelectHTMLAttributes, ChangeEvent } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({
  options,
  placeholder = "Select an option",
  value,
  onChange,
  className = "",
  ...props
}: SelectProps) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#4309ac] focus:border-transparent text-black ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
