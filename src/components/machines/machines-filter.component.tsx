import { useEffect, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Item, ItemContent } from "../ui/item";
import { Label } from "../ui/label";
import { MachineFilter } from "./machines.provider";

enum Difficulties {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  INSANE = "insane",
}

export const MachinesFilter = ({
  onFilterChanged,
}: {
  onFilterChanged?: (filter: MachineFilter) => Promise<void> | void;
}) => {
  const [difficulties, setDifficulties] = useState<string[] | undefined>(
    undefined
  );

  useEffect(() => {
    const object = {
      difficulty: difficulties,
    } as MachineFilter;

    if (onFilterChanged) {
      onFilterChanged.call(this, object);
    }
  }, [difficulties]);

  return (
    <div className="p-4 pb-0">
      <Item variant={"muted"}>
        <ItemContent>
          <div className="flex flex-col space-y-2">
            {Object.keys(Difficulties).map((_, index) => {
              const value = Object.values(Difficulties)[index];
              return (
                <div key={`${_}-${index}`} className="flex items-center gap-3">
                  <Checkbox
                    id={`${value}Difficulty`}
                    onCheckedChange={(isChecked) => {
                      if (isChecked) {
                        setDifficulties((prev) => [...(prev ?? []), value]);
                      } else {
                        setDifficulties((prev) =>
                          prev?.filter((v) => v !== value)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${value}Difficulty`}>
                    {value[0].toUpperCase() + value.slice(1).toLowerCase()}
                  </Label>
                </div>
              );
            })}
          </div>
        </ItemContent>
      </Item>
    </div>
  );
};
