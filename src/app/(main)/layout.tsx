import Header from '#/components/header/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div>{children}</div>
    </>
  );
}
