import * as React from 'react';
import { Select as HeroSelect, ListBox } from '@heroui/react';
import { CaretDown } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

type OptionElement = React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>>;

function toOptions(children: React.ReactNode): { options: OptionElement[]; placeholder?: string } {
  const options = React.Children.toArray(children).filter(
    (child): child is OptionElement =>
      React.isValidElement(child) && child.type === 'option',
  );
  const placeholderOption = options.find((o) => o.props.value === '' || o.props.value === undefined);
  return {
    options: options.filter((o) => o.props.value !== '' && o.props.value !== undefined),
    placeholder: typeof placeholderOption?.props.children === 'string' ? placeholderOption.props.children : undefined,
  };
}

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, value, defaultValue, onChange, onBlur, name, disabled, id, required, autoComplete, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, 'aria-describedby': ariaDescribedby }, ref) => {
    const { options, placeholder } = toOptions(children);
    const isControlled = value !== undefined;
    const [internalKey, setInternalKey] = React.useState<string>(
      defaultValue != null ? String(defaultValue) : value != null ? String(value) : '',
    );
    const rawSelected = isControlled ? (value ?? '') : internalKey;
    const selectedKey = rawSelected === '' ? null : String(rawSelected);

    const handleSelectionChange = (key: React.Key | null) => {
      const next = key === null ? '' : String(key);
      if (!isControlled) setInternalKey(next);
      onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLSelectElement>);
    };

    return (
      <HeroSelect.Root
        ref={ref as React.Ref<HTMLDivElement>}
        name={name}
        isDisabled={disabled}
        placeholder={placeholder}
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        onBlur={onBlur as any}
        id={id}
        isRequired={required}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        className={cn('w-full', className)}
      >
        <HeroSelect.Trigger>
          <HeroSelect.Value />
          <HeroSelect.Indicator>
            <CaretDown weight="bold" className="h-3.5 w-3.5" />
          </HeroSelect.Indicator>
        </HeroSelect.Trigger>
        <HeroSelect.Popover>
          <ListBox>
            {options.map((option) => {
              const optionValue = String(option.props.value);
              return (
                <ListBox.Item
                  key={optionValue}
                  id={optionValue}
                  textValue={String(option.props.children ?? optionValue)}
                >
                  {option.props.children}
                </ListBox.Item>
              );
            })}
          </ListBox>
        </HeroSelect.Popover>
      </HeroSelect.Root>
    );
  },
);
Select.displayName = 'Select';

export { Select };
