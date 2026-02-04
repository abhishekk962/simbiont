import { MuseoModerno } from "next/font/google";
import { auth0 } from "@/lib/auth0";
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

export default async function AuthContainer({ className }: { className?: string }) {
  const session = await auth0.getSession();
  const user = session?.user;
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
          <AuthButton children="Get Started" variant="outline" type="login" />
          <AuthButton children="Log In" type="login" />
        </EmptyContent>
      )}
    </Empty>
    </div>
  );
}
