import React from 'react';

export default function RecentSalesTable({ data, isAdmin }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No recent sales found.</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {isAdmin && <th>Team Member</th>}
          <th>Description</th>
          <th>Date</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {isAdmin && <td>{row.user}</td>}
            <td>{row.description}</td>
            <td style={{ color: 'var(--color-text-muted)' }}>
              {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
            <td className="amount-cell">${Number(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
