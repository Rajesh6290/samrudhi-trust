// Global type declarations

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export {};
