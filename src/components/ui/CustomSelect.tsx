import React, { forwardRef, useMemo } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

export interface CustomSelectOption {
  value: string | number;
  label: React.ReactNode;
  searchText?: string;
  group?: string;
  disabled?: boolean;
}

export interface CustomSelectGroup {
  label: React.ReactNode;
  options: CustomSelectOption[];
}

export interface CustomSelectProps extends Omit<SelectProps, 'options'> {
  label?: string;
  error?: string;
  options?: CustomSelectOption[];
  groups?: CustomSelectGroup[];
}

const CustomSelect = forwardRef<any, CustomSelectProps>(({
  label,
  error,
  options = [],
  groups,
  className,
  ...props
}, ref) => {
  const groupedOptions = useMemo(() => {
    if (groups && groups.length > 0) {
      return groups;
    }

    if (!options || options.length === 0) {
      return null;
    }

    const hasGroup = options.some((opt) => !!opt.group);
    if (!hasGroup) {
      return null;
    }

    const map = new Map<string, CustomSelectOption[]>();
    options.forEach((opt) => {
      const g = opt.group || '';
      if (!map.has(g)) {
        map.set(g, []);
      }
      map.get(g)!.push(opt);
    });

    return Array.from(map.entries()).map(([groupLabel, groupOpts]) => ({
      label: groupLabel,
      options: groupOpts,
    }));
  }, [groups, options]);

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
        className={`w-full h-[46px] ${className || ''} bg-slate-50 rounded-lg border-0`}
        optionFilterProp="label"
        getPopupContainer={(trigger) => trigger.parentElement || document.body}
        placeholder="اختر من القائمة"
        {...props}
      >
        {groupedOptions ? (
          groupedOptions.map((group, gIdx) =>
            group.label ? (
              <Select.OptGroup
                key={gIdx}
                label={
                  <p className="text-xs text-gray-400 font-medium py-1 px-1 border-b border-gray-100 select-none mb-1">
                    {group.label}
                  </p>
                }
              >
                {group.options.map((option) => (
                  <Select.Option
                    key={option.value}
                    value={option.value}
                    label={option.searchText || (typeof option.label === 'string' ? option.label : undefined)}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ) : (
              group.options.map((option) => (
                <Select.Option
                  key={option.value}
                  value={option.value}
                  label={option.searchText || (typeof option.label === 'string' ? option.label : undefined)}
                  disabled={option.disabled}
                >
                  {option.label}
                </Select.Option>
              ))
            )
          )
        ) : (
          options.map((option) => (
            <Select.Option
              key={option.value}
              value={option.value}
              label={option.searchText || (typeof option.label === 'string' ? option.label : undefined)}
              disabled={option.disabled}
            >
              {option.label}
            </Select.Option>
          ))
        )}
      </Select>

      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
