import { SignupForm } from "@/components/SignUp"

export default function SignupPage() {
  return (
    <div
      className="bg-[#000A17] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}
