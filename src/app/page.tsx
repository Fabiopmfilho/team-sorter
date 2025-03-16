import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center self-center pt-4 text-4xl">
      <h1>Team Sorter</h1>

      <Button>
        <Link href="/sort">Sortear os times</Link>
      </Button>
    </div>
  );
}
