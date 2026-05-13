export interface BookingResponse {
  success: boolean;
  message: string;
  error?: string;
}

export async function createBooking(
  formData: FormData
): Promise<BookingResponse> {
  const res = await fetch("booking.php?action=POST", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json();
}