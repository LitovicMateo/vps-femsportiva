export default function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escape "<" so a value containing "</script>" cannot break out of the tag.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
