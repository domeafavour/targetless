import React from "react";

const COUNT_PLACEHOLDER = "@count";

type EventTitleProps = {
  title: string;
  count?: number | null;
};

export function EventTitle({ title, count }: EventTitleProps) {
  if (!title.includes(COUNT_PLACEHOLDER) || count == null) {
    return <>{title}</>;
  }

  const parts = title.split(COUNT_PLACEHOLDER);

  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="font-mono text-cyan-300">{count}</span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
