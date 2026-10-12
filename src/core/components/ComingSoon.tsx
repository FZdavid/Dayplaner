import { EmptyState, PageHeader } from './ui';

export function ComingSoon({ title, emoji }: { title: string; emoji: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState icon={emoji} title="Kommt bald" text="Dieses Modul wird in einer späteren Phase gebaut." />
    </>
  );
}
