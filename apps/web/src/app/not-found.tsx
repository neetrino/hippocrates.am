import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell section">
      <h1>Էջը չի գտնվել</h1>
      <p className="lede">Այս հասցեն Hippocrates-ում չկա։</p>
      <Link className="btn" href="/">Գլխավոր</Link>
    </div>
  );
}
