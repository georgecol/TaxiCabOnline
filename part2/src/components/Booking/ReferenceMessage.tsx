import type React from "react";

export default function ReferenceMessage({
  message,
}: {
  message: string;
}): React.Element | null {
  if (!message) return null;

  return (
    <div className="mt-4 p-3 bg-green-100 rounded">
      {message}
    </div>
  );
}