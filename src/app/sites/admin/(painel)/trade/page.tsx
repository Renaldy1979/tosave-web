import type { Metadata } from "next";
import { TradeList } from "./trade-list";

export const metadata: Metadata = { title: "Clube da Troca" };

export default function TradePage() {
  return <TradeList />;
}
