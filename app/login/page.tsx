import { AuthForm } from "@/app/_components/AuthForm";
import { loginAction } from "@/app/_actions/auth";

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />;
}
