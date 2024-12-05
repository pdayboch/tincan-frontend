import { Category } from "@/lib/definitions";
import Select, { SingleValue } from 'react-select';
import clsx from 'clsx';
import { Inter } from "next/font/google";

const font = Inter({ weight: ["400"], subsets: ['latin'] });

interface SubcategorySelectorProps {
  categories: Category[],
  currentSubcategory: { id: number, name: string } | null;
  onChange: (subcategory: { id: number, name: string }) => void;
  hasError?: boolean;
}

type OptionType = {
  value: number,
  label: string,
};

type GroupedOptionType = {
  label: string,
  options: OptionType[]
};

export default function SubcategorySelector({
  categories,
  currentSubcategory,
  onChange,
  hasError = false
}: SubcategorySelectorProps) {
  const categoryOptions: GroupedOptionType[] = categories.map(
    category => ({
      label: category.name,
      options: category.subcategories.map(subcategory => ({
        value: subcategory.id,
        label: subcategory.name,
      })),
    })
  );

  // Build the currentSubcategory option
  const selectedOption: OptionType | null = currentSubcategory
    ? {
      value: currentSubcategory.id,
      label: currentSubcategory.name
    }
    : null;

  const handleSelectionChange = (option: SingleValue<OptionType>) => {
    if (option) onChange({ id: option.value, name: option.label });
  };

  return (
    <Select
      instanceId="subcategory-selector"
      options={categoryOptions}
      isSearchable
      placeholder="Select subcategory"
      onChange={handleSelectionChange}
      value={selectedOption}
      classNamePrefix="subcategory-selector"
      className={clsx(hasError ? 'error' : '')}
      styles={{
        control: (provided) => ({
          ...provided,
          borderColor: hasError ? 'red' : provided.borderColor,
          fontFamily: font.style.fontFamily,
          '&:hover': {
            borderColor: hasError ? 'red' : provided.borderColor
          }
        }),
        singleValue: (provided) => ({
          ...provided,
          fontFamily: font.style.fontFamily
        }),
        placeholder: (provided) => ({
          ...provided,
          fontFamily: font.style.fontFamily
        }),
        menu: (provided) => ({
          ...provided,
          fontFamily: font.style.fontFamily
        }),
        option: (provided) => ({
          ...provided,
          fontFamily: font.style.fontFamily
        }),
        menuPortal: (provided) => ({
          ...provided,
          zIndex: 9999
        })
      }}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
}