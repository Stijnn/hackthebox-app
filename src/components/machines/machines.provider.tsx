import { Machine, Page } from "@/lib/models";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFetchWrapper } from "../use-fetch-wrapper";
import { ParamsBuilder } from "@/lib/params.builder";

export interface MachineFilter {
  show?: string;
  difficulty?: string[];
  keyword?: string;
}

type MachinesContextProps = {
  machines: Machine[];
  nextPage: () => Promise<Machine[]> | Machine[];
  clear: () => void;
};

const MachinesContext = createContext<MachinesContextProps | null>(null);

export const MachinesProvider = ({
  children,
  filter,
}: {
  children: ReactNode;
  filter?: MachineFilter;
}) => {
  const { fetch } = useFetchWrapper();

  const [currentPage, setCurrentPage] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    setCurrentPage(0);
    setMachines([]);
    fetchPage(1, filter);
  }, [filter]);

  async function fetchPage(page?: number, filter?: MachineFilter) {
    const params = ParamsBuilder.new()
      .addParam("per_page", 15)
      .addParam("page", page)
      .addNullableParam("showCompleted", filter?.show)
      .addNullableArray("difficulty[]", filter?.difficulty)
      .addNullableParam("keyword", filter?.keyword)
      .build({
        encode: false,
      });

    const resp = await fetch(
      `https://labs.hackthebox.com/api/v5/machines?${params}`
    );

    const newPage = (await resp.json()) as Page<Machine>;

    setMachines((prev) => [...prev, ...newPage.data]);
    setCurrentPage(newPage.meta.current_page);

    return newPage.data;
  }

  function clear() {
    setMachines([]);
  }

  useEffect(() => {
    if (hydrated) return;

    setHydrated(true);
  }, []);

  return (
    <MachinesContext.Provider
      value={{
        machines,
        clear,
        nextPage: async () => {
          return await fetchPage(currentPage + 1, filter);
        },
      }}
    >
      {children}
    </MachinesContext.Provider>
  );
};

export const useMachines = () => {
  const ctx = useContext(MachinesContext);

  if (!ctx) {
    throw new Error("useMachines can only be used within a MachinesProvider");
  }

  return ctx;
};
