import Image from "next/image";
import { readProducts } from "@/lib/products";
import AddProductButton from "@/components/AddProductButton";

export const dynamic = "force-dynamic";

export default async function FreeFirePage() {
  const products = (await readProducts()).filter((p) => p.category === "free-fire");

  return (
    <div className="grid gap-6">
      <section className="glass rounded-3xl p-6 md:p-10">
        <h1 className="title">حسابات Free Fire</h1>
        <p className="subtitle">حسابات نادرة وعروض مميزة — اختر ما يناسبك.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} className="glass glass-hover flex flex-col rounded-3xl">
            <div className="relative h-48 shrink-0 overflow-hidden">
              <Image src={p.image || "/uploads/placeholder.svg"} alt={p.title} fill className="object-cover" />
              {p.status === "sold" && (
                <div className="absolute left-2 top-2 z-10 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  تم البيع
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="text-lg font-black">{p.title}</div>
              {p.seller_name && (
                <a href={`/profile/${encodeURIComponent(p.seller_id!)}`} className="mt-1 text-xs font-bold text-indigo-300 hover:text-indigo-200">
                  {p.seller_name}
                </a>
              )}
              <div className="mt-2 flex-1 break-words text-sm leading-7 text-white/70">{p.description}</div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xl font-black text-white">{p.price} دج</div>
                {p.status === "sold" ? (
                  <span className="btn-secondary w-full cursor-not-allowed opacity-50 sm:w-auto text-center">تم البيع</span>
                ) : (
                  <a className="btn-primary w-full sm:w-auto" href={`/products/${encodeURIComponent(p.id)}`}>شراء</a>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
      <AddProductButton />
    </div>
  );
}
