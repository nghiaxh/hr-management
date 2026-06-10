import { Column } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: { label: string; value: string }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValue = column?.getFilterValue() as string | undefined;

  return (
    <Select
      value={selectedValue ?? ''}
      onValueChange={(value) => column?.setFilterValue(value || undefined)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder={title} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
