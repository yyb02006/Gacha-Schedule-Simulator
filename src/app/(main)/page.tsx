import GachaSystemInfoModal from '#/components/modals/GachaSystemInfoModal';
import PickupList, { Dummy } from '#/components/PickupList';

export default async function Home() {
  const pickupDataPresets: { datas: Dummy[] } = await (
    await fetch('https://pub-cee3b616ec754cb4b3678740fdae72a5.r2.dev/banners/pickupDatas.json', {
      cache: 'no-store',
    })
  ).json();

  const now = Date.now();

  const filteredPickupDataPresets = pickupDataPresets.datas.filter(({ expiration }) => {
    const parsedDeactivationDate = expiration ? new Date(expiration).getTime() : Infinity;
    if (now < parsedDeactivationDate) {
      return true;
    } else {
      return false;
    }
  });

  return (
    <section className="relative flex w-dvw justify-center">
      <PickupList pickupDataPresets={filteredPickupDataPresets} />
      <GachaSystemInfoModal />
    </section>
  );
}
