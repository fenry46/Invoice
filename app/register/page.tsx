import { AuthForm } from "@/app/_components/AuthForm";
import { registerAction } from "@/app/_actions/auth";

export default function RegisterPage() {
  return <AuthForm mode="register" action={registerAction} />;
}
