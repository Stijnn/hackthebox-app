import { MachineOverviewItem } from "./machines-overview-item.component";
import { useMachines } from "./machines.provider";

export const MachinesOverview = () => {
  const { machines } = useMachines();

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {machines.map((m, index) => (
        // The item itself no longer needs special flex/size classes,
        // as the grid container dictates the size.
        <div key={`machine-item-wrapper-${index}`}>
          <MachineOverviewItem machine={m} />
        </div>
      ))}
    </div>
  );
};
