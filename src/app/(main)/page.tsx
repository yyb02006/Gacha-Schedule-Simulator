import GachaSystemInfoModal from '#/components/modals/GachaSystemInfoModal';
import PickupList from '#/components/PickupList';

export default function Home() {
  return (
    <section className="relative flex w-screen justify-center">
      <PickupList />
      <GachaSystemInfoModal />
    </section>
  );
}
