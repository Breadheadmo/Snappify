import React, { useState, useEffect } from 'react';

interface Variant {
  _id: string;
  size: string;
  color: string;
  material: string;
  style: string;
  price: number;
  countInStock: number;
  sku: string;
  images: string[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
  className?: string;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantChange,
  className = '',
}) => {
  const [availableOptions, setAvailableOptions] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    materials: [] as string[],
    styles: [] as string[],
  });

  const [selectedOptions, setSelectedOptions] = useState({
    size: '',
    color: '',
    material: '',
    style: '',
  });

  useEffect(() => {
    // Extract all available options
    const sizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));
    const colors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)));
    const materials = Array.from(new Set(variants.filter(v => v.material).map(v => v.material)));
    const styles = Array.from(new Set(variants.filter(v => v.style).map(v => v.style)));

    setAvailableOptions({ sizes, colors, materials, styles });

    // Set initial selection to first variant if no selection
    if (!selectedVariant && variants.length > 0) {
      const firstVariant = variants[0];
      setSelectedOptions({
        size: firstVariant.size,
        color: firstVariant.color,
        material: firstVariant.material,
        style: firstVariant.style,
      });
      onVariantChange(firstVariant);
    }
  }, [variants, selectedVariant, onVariantChange]);

  const handleOptionChange = (optionType: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionType]: value };
    setSelectedOptions(newOptions);

    // Find matching variant
    const matchingVariant = variants.find(variant =>
      variant.size === newOptions.size &&
      variant.color === newOptions.color &&
      variant.material === newOptions.material &&
      variant.style === newOptions.style
    );

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  const getAvailableOptionsForType = (optionType: string) => {
    // Filter options based on current selections
    const currentSelections = { ...selectedOptions };
    delete currentSelections[optionType as keyof typeof currentSelections];

    return variants
      .filter(variant => {
        return Object.entries(currentSelections).every(([key, value]) => {
          if (!value) return true;
          return variant[key as keyof Variant] === value;
        });
      })
      .map(variant => variant[optionType as keyof Variant])
      .filter((value, index, self) => value && self.indexOf(value) === index) as string[];
  };

  const renderOptionGroup = (title: string, optionType: string, options: string[]) => {
    if (options.length === 0) return null;

    const availableOptions = getAvailableOptionsForType(optionType);
    const selectedValue = selectedOptions[optionType as keyof typeof selectedOptions];

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isAvailable = availableOptions.includes(option);
            const isSelected = selectedValue === option;

            return (
              <button
                key={option}
                onClick={() => handleOptionChange(optionType, option)}
                disabled={!isAvailable}
                className={`
                  px-3 py-2 text-sm border rounded-md transition-colors
                  ${isSelected 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : isAvailable 
                      ? 'bg-white text-gray-700 border-gray-300 hover:border-primary-500' 
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }
                `}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderColorOptions = () => {
    if (availableOptions.colors.length === 0) return null;

    const availableColors = getAvailableOptionsForType('color');
    const selectedColor = selectedOptions.color;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Color</h4>
        <div className="flex flex-wrap gap-2">
          {availableOptions.colors.map((color) => {
            const isAvailable = availableColors.includes(color);
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                onClick={() => handleOptionChange('color', color)}
                disabled={!isAvailable}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all relative
                  ${isSelected 
                    ? 'border-primary-600 ring-2 ring-primary-200' 
                    : isAvailable 
                      ? 'border-gray-300 hover:border-primary-500' 
                      : 'border-gray-200 cursor-not-allowed opacity-50'
                  }
                `}
                style={{
                  backgroundColor: color.toLowerCase(),
                }}
                title={color}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={`variant-selector ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Options</h3>
      
      {renderOptionGroup('Size', 'size', availableOptions.sizes)}
      {renderColorOptions()}
      {renderOptionGroup('Material', 'material', availableOptions.materials)}
      {renderOptionGroup('Style', 'style', availableOptions.styles)}

      {selectedVariant && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Selected:</span>
            <span className="font-medium text-gray-900">
              ${selectedVariant.price.toFixed(2)}
            </span>
          </div>
          {selectedVariant.sku && (
            <div className="text-xs text-gray-500 mt-1">
              SKU: {selectedVariant.sku}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {selectedVariant.countInStock > 0 
              ? `${selectedVariant.countInStock} in stock` 
              : 'Out of stock'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;