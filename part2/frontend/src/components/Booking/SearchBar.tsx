import { useState } from "react";

type Props = {
  onSearch: (ref: string) => void;
};

export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 my-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search booking ref (e.g. BRN00001)"
        className="border px-3 py-2 rounded w-64"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Search
      </button>

      <button
        type="button"
        onClick={() => {
          setValue("");
          onSearch("");
        }}
        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
      >
        Reset
      </button>
    </form>
  );
}