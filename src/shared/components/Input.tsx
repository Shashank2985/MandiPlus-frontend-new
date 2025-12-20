import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#4309ac] focus:border-transparent text-black ${className}`}
      {...props}
    />
  );
};

export default Input;
