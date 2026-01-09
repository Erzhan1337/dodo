import Link from "next/link";
import { LoginForm } from "@/features/auth";

export const LoginCard = () => {
  return (
    <div className="w-[30vw] py-10 shadow-xl rounded-2xl bg-white">
      <h3 className="uppercase text-center text-4xl font-black text-primary tracking-wider mb-8">
        Login
      </h3>
      <div className="">
        <div className="w-full flex flex-col items-center">
          <LoginForm />
        </div>
        <div className="text-sm text-center mt-2 font-light">
          У вас еще нет аккаунта?{" "}
          <Link href="/register" className="text-primary underline">
            Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
};
