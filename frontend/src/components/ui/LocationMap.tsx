interface LocationMapProps {
  location: string;
}

export default function LocationMap({ location }: LocationMapProps) {
  const query = encodeURIComponent(location);
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <iframe
        title={`Karte: ${location}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        className="w-full h-44 border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
