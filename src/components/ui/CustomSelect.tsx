import React, { forwardRef } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

// تعريف الـ Props التي سيقبلها المكون
export interface CustomSelectProps extends SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: React.ReactNode; searchText?: string }[];
}

const CustomSelect = forwardRef<any, CustomSelectProps>(({
  label,
  error,
  options,
  className,
  ...props
}, ref) => {
  // React.useEffect(() => {
  //   if ((props.value === undefined || props.value === null || props.value === '') && options && options.length > 0 && props.onChange) {
  //     if (props.value !== options[0].value) {
  //       props.onChange(options[0].value as any, options[0] as any);
  //     }
  //   }
  // }, [options, props.value, props.onChange]);



  return (
    <div className="w-full flex flex-col gap-1 text-start">
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Select
        ref={ref}
        showSearch
        className={`w-full h-[46px] ${className} bg-slate-50 rounded-lg border-0`}
        optionFilterProp="label"
        getPopupContainer={(trigger) => trigger.parentElement || document.body}
        placeholder="اختر من القائمة"
        {...props}
      >
        {options.map((option) => (
          <Select.Option
            key={option.value}
            value={option.value}
            label={option.searchText || option.label}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>

      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
