"use client";

import useSWR from "swr/immutable";

type Counter = {
  count: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const RetroVisitorCounter = () => {
  const { data, error } = useSWR<Counter>("/api/counter", fetcher);

  const formatCount = (count: number) => {
    return count.toString().padStart(6, "0");
  };

  return (
    <span className="os-visitor-inline">
      {error
        ? "ERR"
        : !data
          ? "------"
          : `Visitors: ${formatCount(data.count)}`}
    </span>
  );
};
