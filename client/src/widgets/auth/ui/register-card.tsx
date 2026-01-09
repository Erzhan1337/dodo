import Link from "next/link";
import { RegisterForm } from "@/features/auth";

export const RegisterCard = () => {
  return (
    <div className="w-[30vw] py-10 shadow-xl rounded-2xl bg-white">
      <h3 className="uppercase text-center text-4xl font-black text-primary tracking-wider mb-8">
        Register
      </h3>
      <div className="">
        <div className="w-full flex flex-col items-center">
          <RegisterForm />
        </div>
        <div className="text-sm text-center mt-2 font-light">
          У меня есть аккаунт{" "}
          <Link href="/login" className="text-primary underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};
