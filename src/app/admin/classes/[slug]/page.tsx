export default function Page({ params }: { params: { slug: string } }) {
  return <div>Class Id: {params.slug}</div>;
}
