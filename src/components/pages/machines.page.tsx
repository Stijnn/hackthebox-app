import { useState } from "react";
import { MachinesFilter } from "../machines/machines-filter.component";
import { MachinesOverview } from "../machines/machines-overview.component";
import { MachineFilter, MachinesProvider } from "../machines/machines.provider";

export const MachinesPage = () => {
  const [filter, setFilter] = useState<MachineFilter | null>(null);

  return (
    <div className="w-full h-full">
      <MachinesFilter
        key={"machines-filter-1"}
        onFilterChanged={(newFilter) => {
          setFilter(newFilter);
        }}
      />
      <MachinesProvider
        key={"machines-provider-1"}
        filter={filter ?? undefined}
      >
        <MachinesOverview key={"machines-overview-1"} />
      </MachinesProvider>
    </div>
  );
};
