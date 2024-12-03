import Image from "next/image";
import { AuthComponent } from "@/components/AuthComponent";

export default function AuthPage() {
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
        <AuthComponent />
      </div>
    </div>
  );
}
