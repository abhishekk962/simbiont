import { MuseoModerno } from "next/font/google";
import Profile from "@/components/Profile";
import Image from "next/image";
import AuthButton from "@/components/AuthButton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Logo from "@/components/Logo3D";

const museoModerno = MuseoModerno({
  variable: "--font-museo-moderno",
  subsets: ["latin"],
});

export default async function AuthContainer({ className, user }: { className?: string, user?: any }) {

  return (
    <div className={className + " hero-animate"}>
    <Empty className="max-h-fit">
      <EmptyHeader>
        <EmptyMedia variant="default">
          {/* <Image
            className="p-1"
            src="/logo.svg"
            alt="simbiont logo"
            width={200}
            height={200}
            priority
          /> */}
        </EmptyMedia>
        <EmptyTitle
          className={`text-5xl ${museoModerno.className} font-medium select-none`}
        >
          simbiont
        </EmptyTitle>
        <EmptyDescription className="text-xl select-none">
          A creative intelligence canvas.
        </EmptyDescription>
      </EmptyHeader>
      {user ? (
        <EmptyContent className="flex-row justify-center gap-2">
          <Profile />
          <AuthButton children="Log Out" type="logout" />
        </EmptyContent>
      ) : (
        <EmptyContent className="flex-row justify-center gap-2">
          <AuthButton children="Get started" variant="outline" type="login" />
        </EmptyContent>
      )}
    </Empty>
    </div>
  );
}
