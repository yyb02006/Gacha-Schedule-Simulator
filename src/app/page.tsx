export default function Home() {
  return (
    <section className="flex h-screen w-screen flex-col items-center">
      <h1 className="flex h-20 items-center">명리빵저우 가챠 일정 시뮬레이터</h1>
      <div className="">한 번에 입력하기</div>
      <div className="m-6 space-y-12">
        <div className="flex h-[160px] w-[480px] items-center justify-center rounded-[36px] bg-gradient-to-br from-[#1d1d1d] to-[#222222] p-4 shadow-[12px_12px_32px_#141414,-10px_-12px_32px_#2c2c2c]"></div>
        <div className="flex h-[160px] w-[480px] items-center justify-center rounded-[36px] bg-gradient-to-br from-[#1d1d1d] to-[#222222] p-4 shadow-[12px_12px_32px_#141414,-10px_-12px_32px_#2c2c2c]"></div>
      </div>
      <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1d1d1d] to-[#222222] p-4 shadow-[6px_6px_13px_#141414,-6px_-6px_13px_#2c2c2c]">
        <svg className="size-12 text-amber-300">
          <use href="/icons/icons.svg#add" />
        </svg>
      </div>
    </section>
  );
}
