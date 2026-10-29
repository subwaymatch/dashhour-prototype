import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BANKS, BRANCHES, getBranch } from "@/lib/data";
import { BranchScreen } from "@/components/screens/branch";

export function generateStaticParams() {
  return BRANCHES.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const branch = getBranch((await params).id);
  if (!branch) return {};
  const name = `${BANKS[branch.bank].name.en} ${branch.name.en}`;
  return {
    title: name,
    description: `Live queue, crowd by hour and directions for ${name}. ${branch.address.en}.`,
  };
}

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getBranch(id)) notFound();
  return <BranchScreen id={id} />;
}
