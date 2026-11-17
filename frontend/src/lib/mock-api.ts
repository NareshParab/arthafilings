// MOCK: replace with real API in backend phase.
export async function mockVerifyOtp(otp: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: /^\d{6}$/.test(otp) };
}

// MOCK: replace with real API in backend phase.
export async function mockSubmitContactForm(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: Boolean(data.name && data.email) };
}
