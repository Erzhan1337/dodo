"use client";
import { FilterInput, RangeSlider } from "@/shared/ui";
import { useEffect, useState, KeyboardEvent } from "react";

interface Props {
  min?: number;
  max?: number;
  priceFrom?: number;
  priceTo?: number;
  onChange: (values: number[]) => void;
  onChangeInput: (name: "priceFrom" | "priceTo", value: number) => void;
}

export const FilterByPrice = ({
  min = 0,
  max = 5000,
  priceFrom,
  priceTo,
  onChange,
}: Props) => {
  const [localValues, setLocalValues] = useState({
    from: String(priceFrom ?? min),
    to: String(priceTo ?? max),
  });

  useEffect(() => {
    setLocalValues({
      from: String(priceFrom ?? min),
      to: String(priceTo ?? max),
    });
  }, [priceFrom, priceTo, min, max]);

  const handleBlur = () => {
    let from = Number(localValues.from);
    let to = Number(localValues.to);

    if (isNaN(from)) from = min;
    if (isNaN(to)) to = max;

    if (from < min) from = min;
    if (to > max) to = max;

    if (from > to) {
      [from, to] = [to, from];
    }

    setLocalValues({ from: String(from), to: String(to) });

    onChange([from, to]);
  };

  const handleChange = (name: "from" | "to", value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const sliderValue = [
    isNaN(Number(localValues.from)) ? min : Number(localValues.from),
    isNaN(Number(localValues.to)) ? max : Number(localValues.to),
  ];

  return (
    <div>
      <p className="font-bold text-sm mb-3">Цена от и до:</p>
      <div className="flex items-center gap-5 mb-5">
        <FilterInput
          suffix="₸"
          type="number"
          placeholder={String(min)}
          min={min}
          max={max}
          value={localValues.from}
          onChange={(e) => handleChange("from", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <FilterInput
          suffix="₸"
          type="number"
          placeholder={String(max)}
          min={min}
          max={max}
          value={localValues.to}
          onChange={(e) => handleChange("to", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
      <RangeSlider
        min={min}
        max={max}
        step={100}
        value={sliderValue}
        onValueChange={(values) => {
          setLocalValues({ from: String(values[0]), to: String(values[1]) });
          onChange(values);
        }}
      />
    </div>
  );
};
