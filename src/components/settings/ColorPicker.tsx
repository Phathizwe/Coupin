import React from 'react';

interface ColorPickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  description 
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          name={name}
          value={value}
          onChange={onChange}
          className="w-10 h-10 border-0 p-0"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          title="Please enter a valid hex color code (e.g. #FF0000)"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {description}
      </p>
    </div>
  );
};

export default ColorPicker;