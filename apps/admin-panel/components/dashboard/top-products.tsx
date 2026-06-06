import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@rrs/shared";
import { TrendingUp } from "lucide-react";

interface Product {
  id: string; name: string; sales_count: number;
  avg_rating: number; base_price: number;
  images: { url: string; is_primary: boolean }[];
}

export function TopProducts({ products }: { products: Product[] }) {
  return (
    <div className="card-admin">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <TrendingUp size={16} className="text-royal-gold-500" />
        <h2 className="font-semibold text-gray-900">Top Products</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {products.map((product, i) => {
          const image = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
          return (
            <Link key={product.id} href={`/products/${product.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <div className="w-9 h-9 rounded-lg bg-desert-sand overflow-hidden flex-shrink-0">
                {image ? <Image src={image} alt={product.name} width={36} height={36} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌶</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.sales_count} sold · ★{product.avg_rating.toFixed(1)}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">{formatCurrency(product.base_price)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
