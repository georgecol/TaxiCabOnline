import type { JSX } from "react";

export default function ReferenceMessage({
  message,
}: {
  message: string;
}): JSX.Element | null {
  if (!message) return null;

  return (
    <div className="mt-4 p-3 bg-green-100 rounded">
      {message}
    </div>
  );
}