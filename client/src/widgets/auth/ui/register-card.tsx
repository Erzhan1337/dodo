import Link from "next/link";
import { RegisterForm } from "@/features/auth";
import { ArrowLeft } from "lucide-react";

export const RegisterCard = () => {
  return (
    <div className="relative w-[85vw] md:w-[60vw] lg:w-[50vw] xl:w-[35vw] py-8 lg:py-10 shadow-xl rounded-2xl bg-white">
      <Link
        href="/"
        className="absolute top-6 left-4 text-primary/60 hover:text-primary transition-colors duration-300"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <h3 className="uppercase text-center text-2xl lg:text-4xl font-black text-primary tracking-wider mb-8">
        Register
      </h3>
      <div>
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
