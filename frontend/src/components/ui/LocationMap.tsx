interface LocationMapProps {
  location: string;
}

export default function LocationMap({ location }: LocationMapProps) {
  const query = encodeURIComponent(location);
  return (
    <div className="overflow-hidden rounded-[26px] border-[2.5px] border-ink shadow-pop">
      <iframe
        title={`Karte: ${location}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        className="w-full h-44 border-0 block"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
