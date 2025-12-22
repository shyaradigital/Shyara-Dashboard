import type { Invoice } from "../types/invoice"
import { formatCurrencyNumber } from "./formatters"

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  if (!text) return ""
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Generate invoice HTML from template with dynamic data
 * Removes: TAN, SAC column, Project field, CGST/SGST
 * Replaces: Logo placeholder with actual logo
 */
export function generateInvoiceHTML(invoice: Invoice): string {
  const { client, services, subtotal, totalDiscount, grandTotal } = invoice

  // Generate services table rows
  const servicesRows = services
    .map((service, index) => {
      return `
            <tr>
              <td class="center">${index + 1}</td>
              <td>
                ${escapeHtml(service.description || "")}
              </td>
              <td class="center">${service.quantity || 0}</td>
              <td class="num">${formatCurrencyNumber(service.rate || 0)}</td>
              <td class="num">${formatCurrencyNumber(service.amount || 0)}</td>
            </tr>
          `
    })
    .join("")

  // Format dates (invoiceDate and dueDate are already in DD/MM/YYYY format from the hook)
  const invoiceDate = escapeHtml(invoice.invoiceDate || "DD/MM/YYYY")
  const dueDate = escapeHtml(invoice.dueDate || "DD/MM/YYYY")

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice | SHYARA TECH SOLUTION (OPC) PRIVATE LIMITED</title>
  <style>
    :root{
      --bg1:#faf7ff;
      --bg2:#f3edff;
      --card:#ffffff;
      --ink:#1f1633;
      --muted:#6a5b86;
      --line:#e8def8;
      --accent:#7c3aed;    /* purple */
      --accent2:#a78bfa;   /* light purple */
      --accent3:#ede9fe;   /* very light */
      --success:#16a34a;
      --shadow: 0 18px 45px rgba(124,58,237,.12);
      --radius: 18px;
    }

    *{box-sizing:border-box}
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      color:var(--ink);
      background:
        radial-gradient(1100px 700px at 18% 10%, #efe7ff 0%, transparent 60%),
        radial-gradient(900px 600px at 85% 25%, #e8dcff 0%, transparent 55%),
        linear-gradient(180deg, var(--bg1), var(--bg2));
      padding:24px;
    }

    .page{
      max-width: 980px;
      min-width: min(980px, 100%);
      margin: 0 auto;
      width: 100%;
    }

    .invoice-card{
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow:hidden;
    }

    /* header */
    .topbar{
      position: relative;
      padding: 28px 28px 18px;
      background:
        linear-gradient(135deg, rgba(124,58,237,.16), rgba(167,139,250,.14)),
        linear-gradient(0deg, #fff, #fff);
      border-bottom: 1px solid var(--line);
    }

    .topbar::after{
      content:"";
      position:absolute;
      inset:-40px -40px auto auto;
      width:220px;
      height:220px;
      background: radial-gradient(circle at 30% 30%, rgba(124,58,237,.22), rgba(124,58,237,0) 60%);
      transform: rotate(18deg);
      pointer-events:none;
    }

    .head{
      display:flex;
      gap:16px;
      align-items:flex-start;
      justify-content:space-between;
      flex-wrap:wrap;
    }

    .brand{
      display:flex;
      gap:14px;
      align-items:flex-start;
      min-width: 300px;
    }

    .logo{
      width:46px;
      height:46px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display:grid;
      place-items:center;
      color:#fff;
      font-weight:800;
      letter-spacing:.5px;
      box-shadow: 0 12px 26px rgba(124,58,237,.22);
      flex:0 0 auto;
      overflow:hidden;
    }

    .logo img{
      width:100%;
      height:100%;
      object-fit:cover;
    }

    .brand h1{
      margin:0;
      font-size: 18px;
      line-height:1.25;
      letter-spacing:.2px;
    }

    .brand p{
      margin:6px 0 0;
      color: var(--muted);
      font-size: 12.5px;
      line-height:1.45;
    }

    .invoice-meta{
      text-align:right;
      min-width: 260px;
    }

    .badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: var(--accent3);
      border: 1px solid var(--line);
      color: var(--accent);
      font-weight: 700;
      font-size: 12px;
    }

    .meta-grid{
      margin-top: 12px;
      display:grid;
      grid-template-columns: 1fr;
      gap: 8px;
      justify-items:end;
      color: var(--muted);
      font-size: 12.5px;
    }

    .meta-grid strong{
      color: var(--ink);
      font-weight: 700;
    }

    /* body layout */
    .content{
      padding: 22px 28px 26px;
    }

    .two-col{
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .box{
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 14px 14px 12px;
      background: linear-gradient(180deg, #fff, #fff), linear-gradient(135deg, rgba(124,58,237,.07), rgba(167,139,250,.06));
      position:relative;
    }
    .box::before{
      content:"";
      position:absolute;
      inset:0;
      border-radius:16px;
      background: linear-gradient(135deg, rgba(124,58,237,.06), rgba(167,139,250,.05));
      pointer-events:none;
    }
    .box > *{position:relative}

    .box h3{
      margin:0 0 8px;
      font-size: 12px;
      letter-spacing:.14em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .kv{
      display:grid;
      grid-template-columns: 120px 1fr;
      gap: 6px 10px;
      font-size: 13px;
      line-height: 1.45;
      color: var(--muted);
    }
    .kv div b{
      color: var(--ink);
      font-weight: 700;
    }

    /* items table */
    table{
      width:100%;
      border-collapse:separate;
      border-spacing: 0;
      overflow:hidden;
      border-radius: 16px;
      border: 1px solid var(--line);
      margin-top: 10px;
    }
    thead th{
      background: linear-gradient(135deg, rgba(124,58,237,.10), rgba(167,139,250,.10));
      color: var(--ink);
      font-size: 12px;
      letter-spacing:.08em;
      text-transform: uppercase;
      padding: 12px 12px;
      border-bottom: 1px solid var(--line);
      text-align:left;
      white-space:nowrap;
    }
    tbody td{
      padding: 12px 12px;
      border-bottom: 1px solid var(--line);
      font-size: 13.5px;
      color: var(--ink);
      vertical-align:top;
    }
    tbody tr:last-child td{border-bottom:none}
    td.num, th.num{ text-align:right; font-variant-numeric: tabular-nums; }
    td.center, th.center{ text-align:center; }

    .desc{
      color: var(--muted);
      font-size: 12.5px;
      margin-top: 4px;
      line-height:1.35;
    }

    /* totals */
    .bottom{
      display:grid;
      grid-template-columns: 1.3fr .7fr;
      gap: 16px;
      margin-top: 16px;
      align-items:start;
    }

    .notes{
      border: 1px dashed rgba(124,58,237,.35);
      background: rgba(237,233,254,.55);
      border-radius: 16px;
      padding: 12px 14px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .notes b{ color: var(--ink); }

    .totals{
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow:hidden;
    }
    .totals .row{
      display:flex;
      justify-content:space-between;
      padding: 11px 12px;
      border-bottom: 1px solid var(--line);
      font-size: 13.5px;
      color: var(--muted);
    }
    .totals .row strong{
      color: var(--ink);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .totals .row:last-child{border-bottom:none}
    .totals .grand{
      background: linear-gradient(135deg, rgba(124,58,237,.12), rgba(167,139,250,.12));
      color: var(--ink);
    }
    .totals .grand span{
      font-weight: 800;
      color: var(--ink);
    }

    /* footer */
    .footer{
      padding: 18px 28px 26px;
      border-top: 1px solid var(--line);
      display:flex;
      gap: 12px;
      justify-content:space-between;
      flex-wrap:wrap;
      align-items:flex-end;
      background: linear-gradient(180deg, rgba(237,233,254,.35), rgba(255,255,255,.9));
    }

    .bank{
      min-width: 320px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
    .bank b{ color: var(--ink); }

    .sign{
      text-align:right;
      min-width: 260px;
      color: var(--muted);
      font-size: 13px;
    }

    .sigline{
      margin-top: 28px;
      border-top: 1px solid var(--line);
      padding-top: 10px;
      color: var(--ink);
      font-weight: 700;
    }

    /* print */
    @page {
      size: A4;
      margin: 10mm 15mm;
    }

    @media print{
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      body{ 
        background:#fff !important; 
        padding:0 !important;
        margin: 0;
      }
      
      .page{ 
        max-width: 100% !important;
        min-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .invoice-card{ 
        box-shadow:none !important;
        border: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .topbar {
        padding: 15px 20px 10px !important;
        background: #fff !important;
        border-bottom: 1px solid #ddd !important;
      }
      
      .topbar::after {
        display: none !important;
      }
      
      .content {
        padding: 15px 20px !important;
      }
      
      .footer {
        padding: 15px 20px !important;
        border-top: 1px solid #ddd !important;
        background: #fff !important;
      }
      
      .badge{ 
        border-color:#ddd !important;
        background: #f3f4f6 !important;
      }
      
      .notes{ 
        border-style:solid !important;
        border-color: #ddd !important;
        background: #f9fafb !important;
      }
      
      table {
        border: 1px solid #ddd !important;
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      tfoot {
        display: table-footer-group;
      }
      
      .bottom {
        page-break-inside: avoid;
      }
      
      .totals {
        page-break-inside: avoid;
      }
      
      a{ 
        color:inherit !important; 
        text-decoration:none !important; 
      }
      
      /* Ensure proper spacing for print */
      .two-col {
        margin-bottom: 12px !important;
      }
      
      .box {
        padding: 10px 12px !important;
        margin-bottom: 0 !important;
      }
      
      /* Hide tip message */
      .page > div:last-child {
        display: none !important;
      }
    }
  </style>
</head>

<body>
  <div class="page">
    <div class="invoice-card">
      <div class="topbar">
        <div class="head">
          <div class="brand">
            <div class="logo"><img src="/logo.png" alt="Logo" /></div>
            <div>
              <h1>SHYARA TECH SOLUTION (OPC) PRIVATE LIMITED</h1>
              <p>
                Lata Kunj, Jai Hanuman Colony, Bazar Samiti,<br/>
                Patna – 800006, Bihar
              </p>
              <p style="margin-top:8px">
                <b style="color:var(--ink)">CIN:</b> U62011BR2025OPC080949 &nbsp;•&nbsp;
                <b style="color:var(--ink)">PAN:</b> ABSCS1802N
              </p>
            </div>
          </div>

          <div class="invoice-meta">
            <div class="badge">TAX INVOICE</div>
            <div class="meta-grid">
              <div><strong>Invoice No:</strong> ${escapeHtml(invoice.invoiceNumber || "")}</div>
              <div><strong>Invoice Date:</strong> ${invoiceDate}</div>
              <div><strong>Due Date:</strong> ${dueDate}</div>
              <div><strong>Place of Supply:</strong> ${escapeHtml(invoice.placeOfSupply || "")}</div>
              <div><strong>Currency:</strong> ${escapeHtml(invoice.currency || "")}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="two-col">
          <div class="box">
            <h3>Billed To</h3>
            <div class="kv">
              <div><b>Client:</b></div><div>${escapeHtml(client.name || "—")}</div>
              <div><b>Company:</b></div><div>${escapeHtml(client.company || "—")}</div>
              <div><b>Address:</b></div><div>${escapeHtml(client.address || "—")}</div>
              <div><b>GSTIN:</b></div><div>${escapeHtml(client.gstin || "—")}</div>
              <div><b>Email:</b></div><div>${escapeHtml(client.email || "—")}</div>
            </div>
          </div>

          <div class="box">
            <h3>Invoice Details</h3>
            <div class="kv">
              <div><b>PO / Ref:</b></div><div>${escapeHtml(invoice.poRef || "—")}</div>
              <div><b>Payment:</b></div><div>${escapeHtml(invoice.paymentTerms || "—")}</div>
              <div><b>Terms:</b></div><div>${escapeHtml(invoice.paymentTerms || "—")}</div>
              <div><b>GST:</b></div><div>${client.gstin ? "GST applicable" : "Add GSTIN when available"}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="center" style="width:64px;">S. No</th>
              <th>Description</th>
              <th class="center" style="width:70px;">Qty</th>
              <th class="num" style="width:120px;">Rate (₹)</th>
              <th class="num" style="width:140px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows}
          </tbody>
        </table>

        <div class="bottom">
          <div class="notes">
            <b>Notes / Terms</b><br/>
            ${invoice.notes ? escapeHtml(invoice.notes).replace(/\n/g, "<br/>") : `• Kindly mention <b>Invoice No</b> in the payment reference.<br/>
            • Late payment may attract additional charges as per agreement.<br/>
            • This is a system-generated invoice and is valid with authorized signatory.`}
          </div>

          <div class="totals">
            <div class="row"><span>Subtotal</span><strong>₹ ${formatCurrencyNumber(subtotal)}</strong></div>
            <div class="row"><span>Discount</span><strong>₹ ${formatCurrencyNumber(totalDiscount)}</strong></div>
            <div class="row grand"><span>Total Payable</span><span>₹ ${formatCurrencyNumber(grandTotal)}</span></div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="bank">
          <b>Bank Details</b><br/>
          Account Name: <b>SHYARA TECH SOLUTION (OPC) PRIVATE LIMITED</b><br/>
          Bank Name: <b>XXXX Bank</b> &nbsp;|&nbsp; A/C No: <b>XXXXXXXXXXXX</b><br/>
          IFSC: <b>XXXXXXXX</b> &nbsp;|&nbsp; Branch: <b>Patna</b><br/>
          UPI ID (optional): <b>yourupi@bank</b>
        </div>

        <div class="sign">
          For <b style="color:var(--ink)">SHYARA TECH SOLUTION (OPC) PRIVATE LIMITED</b>
          <div class="sigline">Authorized Signatory</div>
          <div style="margin-top:6px; font-size:12px; color:var(--muted)">
            (Signature / Stamp)
          </div>
        </div>
      </div>
    </div>

    <div style="margin:14px 6px 0; color:var(--muted); font-size:12.5px; text-align:center;">
      Tip: Press <b>Ctrl + P</b> to print or save as PDF. (Print formatting included)
    </div>
  </div>
</body>
</html>`
}

