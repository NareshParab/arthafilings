// MOCK: replace with real API in backend phase.
export async function mockVerifyOtp(otp: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: /^\d{6}$/.test(otp) };
}
