type Props = {
  onSubmit: (formData: FormData) => void;
};

export default function BookingForm({ onSubmit }: Props): JSX.Element {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="cname" className="input" placeholder="Name" />
      <input name="phone" className="input" placeholder="Phone" />

      <input name="unumber" className="input" placeholder="Unit" />
      <input name="snumber" className="input" placeholder="Street #" />
      <input name="stname" className="input" placeholder="Street" />

      <input name="sbname" className="input" placeholder="Suburb" />
      <input name="dsbname" className="input" placeholder="Destination" />

      <input type="date" name="date" className="input" />
      <input type="time" name="time" className="input" />

      <button className="btn">Book</button>
    </form>
  );
}
