import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <h2 className="text-4xl font-bold">404 - Link Not Found</h2>
      <p className="mt-4 text-lg text-muted-foreground">
        The link you&apos;re looking for doesn&apos;t exist or you don&apos;t
        have access to the organization.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Return Home
      </Link>
    </div>
  );
}
