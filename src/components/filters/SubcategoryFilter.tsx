import { Category } from "@/lib/definitions";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Select, { MultiValue } from 'react-select';

interface SubcategoryFilterProps {
  categories: Category[]
}

type OptionType = {
  id: number,
  value: number,
  label: string
};

type GroupedOptionType = {
  id: number,
  label: string,
  options: OptionType[]
};

const PARAM_NAME = 'subcategories[]';

export default function SubcategoryFilter({
  categories
}: SubcategoryFilterProps) {
  const [selectedSubcategories, setSelectedSubcategories] = useState<OptionType[]>([]);

  const categoryOptions: GroupedOptionType[] = useMemo(() => {
    return categories.map(
    category => ({
      id: category.id,
      label: category.name,
      options: category.subcategories.map(subcategory => ({
        id: subcategory.id,
        value: subcategory.id,
        label: subcategory.name,
      })),
    }));
  }, [categories]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const param = searchParams.getAll(PARAM_NAME);
    const newSelectedSubcategories = categoryOptions.flatMap(
      group =>
        group.options.filter(
          option => param.includes(String(option.value))
        )
    );

    setSelectedSubcategories(newSelectedSubcategories);
  }, [searchParams, categoryOptions]);

  const handleSelectionChange = (
    selectedOptions: MultiValue<OptionType>
  ) => {
    const params = new URLSearchParams(searchParams);
    // Reset pagination to page 1
    params.delete('startingAfter');
    params.delete('endingBefore');

    // Update url param
    if (selectedOptions.length > 0) {
      const selectedIds = selectedOptions.map(option =>
        String(option.value)
      );
      params.delete(PARAM_NAME);
      selectedIds.forEach(id => params.append(PARAM_NAME, id))
    } else {
      params.delete(PARAM_NAME);
    }

    replace(`${pathname}?${params.toString()}`)
  };

  return (
    <Select
      instanceId="subcategory-filter-select"
      options={categoryOptions}
      isMulti
      isSearchable
      placeholder="All subcategories"
      onChange={handleSelectionChange}
      value={selectedSubcategories}
    />
  );
}