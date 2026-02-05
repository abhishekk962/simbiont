import { auth0 } from "@/lib/auth0";
import Logo from "@/components/Logo3D";
import AuthContainer from "@/components/AuthContainer";
import ClientContainer from "@/components/ClientContainer";
import Main from "@/components/Main";
import { BlurDottedBackground } from "@/components/BlurDottedBackground";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-evenly px-4">
        <BlurDottedBackground />
        <ClientContainer>
          <Logo width={"100vw"} height={"100vh"} />
        </ClientContainer>
        <AuthContainer className="absolute translate-y-30" user={user} />
      </div>
    );
  } else {
    return <Main />;
  }
}
