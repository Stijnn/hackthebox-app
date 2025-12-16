import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useFetchWrapper } from "../use-fetch-wrapper";

export interface ActiveMachine {
  id: number;
  name: string;
  avatar: string;
  type: string;
  expires_at: string;
  isSpawning: boolean;
  lab_server: string;
  vpn_server_id: number;
  ip: string;
}

const ActiveMachineContext = createContext<{
  activeMachine: ActiveMachine | null;
} | null>(null);

export const ActiveMachineProvider = ({
  children,
  polling,
}: {
  children: ReactNode;
  polling?: { interval: number };
}) => {
  const _pollingIntervalHandleRef = useRef<NodeJS.Timeout | null>(null);

  const { fetch } = useFetchWrapper();

  const [activeMachine, setActiveMachine] = useState<ActiveMachine | null>(
    null
  );

  async function fetchActiveMachine() {
    const response = await fetch(
      "https://labs.hackthebox.com/api/v4/machine/active"
    );
    const object = (await response.json()) as { info: ActiveMachine | null };

    console.log(object.info !== activeMachine, object.info, activeMachine);
    if (!!!object.info) {
      setActiveMachine(null);
    } else {
      if (object.info.id === activeMachine?.id) return;
      setActiveMachine((prev) =>
        prev?.id === object.info?.id ? prev : object.info
      );
    }
  }

  useEffect(() => {
    if (polling) {
      const handle = setInterval(async () => {
        await fetchActiveMachine();
      }, polling.interval);
      _pollingIntervalHandleRef.current = handle;
    } else {
      fetchActiveMachine();
    }

    return () => {
      if (_pollingIntervalHandleRef.current) {
        clearInterval(_pollingIntervalHandleRef.current);
      }
    };
  }, []);

  return (
    <ActiveMachineContext
      value={{
        activeMachine,
      }}
    >
      {children}
    </ActiveMachineContext>
  );
};

export const useActiveMachine = () => {
  const ctx = useContext(ActiveMachineContext);

  if (!ctx) {
    throw new Error(
      "useActiveMachine can only be used within a ActiveMachineProvider"
    );
  }

  return ctx;
};
