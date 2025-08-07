// IntensitySelector.tsx
import React from "react";

type Props = {
  selected: number;
  onSelect: (level: number) => void;
};

const colors = ["#8DD7F4", "#C0E5A9", "#FFE57F", "#FFB74D", "#EF5350"];

const IntensitySelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="flex space-x-2 mt-2">
      {colors.map((color, index) => {
        const level = index + 1;
        const isSelected = selected === level;
        return (
          <button
            key={level}
            className={`w-5 h-5 rounded-full transition-all duration-150`}
            style={{
              backgroundColor: color,
              border: isSelected ? "2px solid white" : "1px solid #ccc",
              transform: isSelected ? "scale(1.4)" : "scale(1)",
            }}
            onClick={() => onSelect(level)}
          />
        );
      })}
    </div>
  );
};

export default IntensitySelector;
