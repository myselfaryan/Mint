import SubmissionsPage from "@/app/[orgId]/submissions/page";

export default function SubmissionsPageWrapper({
  params,
}: {
  params: {
    orgId: string;
    id: string;
  };
}) {
  return <SubmissionsPage params={params} />;
}
