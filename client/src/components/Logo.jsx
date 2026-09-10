export default function Logo({ className = "", compact = false }) {
  if (compact) {
    return (
      <img
        className={`gs-logo gs-logo-mark ${className}`.trim()}
        src="/logo-mark.svg"
        alt="GlassSteel"
        width={40}
        height={40}
      />
    );
  }

  return (
    <span className={`gs-logo-lockup ${className}`.trim()}>
      <img
        className="gs-logo-mark"
        src="/logo-mark.svg"
        alt=""
        width={40}
        height={40}
        aria-hidden="true"
      />
      <span className="gs-logo-text">
        <strong>GlassSteel</strong>
        <em>Trading</em>
      </span>
    </span>
  );
}
