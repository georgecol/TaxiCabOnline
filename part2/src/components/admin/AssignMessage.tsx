export default function AssignMessage({
  message,
}: {
  message: string;
}): JSX.Element | null {
  if (!message) return null;

  return <p className="text-green-600 my-2">{message}</p>;
}