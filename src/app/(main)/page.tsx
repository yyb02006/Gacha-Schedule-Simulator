import GachaSystemInfoModal from '#/components/modals/GachaSystemInfoModal';
import PickupList, { Dummy } from '#/components/PickupList';
import { PickupDataPresets } from '#/types/types';

export default async function Home() {
  const pickupDataPresets: { datas: PickupDataPresets } = await (
    await fetch('https://pub-cee3b616ec754cb4b3678740fdae72a5.r2.dev/banners/pickupDatas.json')
  ).json();

  const now = Date.now();

  const filteredPickupDataPresets = pickupDataPresets.datas.reduce<Dummy[]>((acc, current) => {
    const { deactivationDate, ...rest } = current;
    const parsedDeactivationDate = deactivationDate
      ? new Date(deactivationDate).getTime()
      : Infinity;
    if (now < parsedDeactivationDate) {
      acc.push(rest);
    }
    return acc;
  }, []);

  return (
    <section className="relative flex w-dvw justify-center">
      <PickupList pickupDataPresets={filteredPickupDataPresets} />
      <GachaSystemInfoModal />
    </section>
  );
}
