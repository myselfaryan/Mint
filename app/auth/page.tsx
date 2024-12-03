import Image from "next/image";
import { AuthComponent } from "@/components/auth-component";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const mode = searchParams?.mode === "register" ? "register" : "login";

  return (
    <div className="flex h-screen">
      <div className="w-1/2 relative">
        <Image
          src="/placeholder.svg"
          alt="Authentication"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="w-1/2 flex items-center justify-center">
        <AuthComponent initialMode={mode} />
      </div>
    </div>
  );
}
