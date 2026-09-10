export default function EscrowBank({ company, compact = false }) {
  if (!company?.account_number) return null;

  const rows = [
    ["Account name", company.account_name],
    ["Bank", company.bank_name],
    ["Account no.", company.account_number],
    ["IFSC", company.ifsc_code],
    ["Branch", company.branch_name],
    ["UPI", company.upi_id],
  ];

  return (
    <div className={`escrow-card${compact ? " compact" : ""}`}>
      <div className="escrow-head">
        <span className="eyebrow">Bank transfer</span>
        <h3>Pay to GLASSTEEL account</h3>
      </div>
      <dl className="escrow-grid">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ) : null
        )}
      </dl>
      {company.escrow_note ? (
        <p className="escrow-note">{company.escrow_note}</p>
      ) : null}
    </div>
  );
}
