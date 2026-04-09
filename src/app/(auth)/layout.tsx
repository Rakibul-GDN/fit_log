/** Auth route group layout — unauthenticated pages with minimal structure. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
