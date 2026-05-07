import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Customer, Deduction, Fish, Invoice, InvoiceItem } from "@prisma/client";
import { formatDate, formatIDR, formatNumber } from "@/lib/format";

type InvoicePdfData = Invoice & {
  customer: Customer | null;
  items: (InvoiceItem & { fish: Fish })[];
  deductions: Deduction[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 10,
    marginBottom: 14,
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  invoiceNumber: { fontSize: 10, color: "#64748b", marginTop: 2 },
  dateText: { fontSize: 10, color: "#64748b" },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  customerName: { fontFamily: "Helvetica-Bold" },
  customerPhone: { color: "#64748b", marginTop: 1 },
  section: { marginBottom: 14 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
  },
  colName: { flex: 2 },
  colNum: { flex: 1, textAlign: "right" },
  th: { fontFamily: "Helvetica-Bold", color: "#64748b", fontSize: 9 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalsLabel: { color: "#64748b" },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
    marginTop: 4,
  },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  deductionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 4,
  },
});

export function InvoicePdf({ invoice }: { invoice: InvoicePdfData }) {
  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Faktur</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(invoice.createdAt)}</Text>
        </View>

        {invoice.customer && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tagih ke</Text>
            <Text style={styles.customerName}>{invoice.customer.name}</Text>
            {invoice.customer.phone && (
              <Text style={styles.customerPhone}>{invoice.customer.phone}</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Barang</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.colName, styles.th]}>Ikan</Text>
            <Text style={[styles.colNum, styles.th]}>Berat (kg)</Text>
            <Text style={[styles.colNum, styles.th]}>Harga / kg</Text>
            <Text style={[styles.colNum, styles.th]}>Subtotal</Text>
          </View>
          {invoice.items.map((it) => (
            <View key={it.id} style={styles.tableRow}>
              <Text style={styles.colName}>{it.fish.name}</Text>
              <Text style={styles.colNum}>{formatNumber(it.weightKg)}</Text>
              <Text style={styles.colNum}>{formatIDR(it.pricePerKg)}</Text>
              <Text style={styles.colNum}>{formatIDR(it.subtotal)}</Text>
            </View>
          ))}
        </View>

        {invoice.deductions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Potongan</Text>
            {invoice.deductions.map((d) => (
              <View key={d.id} style={styles.deductionRow}>
                <Text>{d.description}</Text>
                <Text>- {formatIDR(d.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total kotor</Text>
            <Text>{formatIDR(invoice.grossTotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Potongan</Text>
            <Text>- {formatIDR(invoice.totalDeductions)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total akhir</Text>
            <Text style={styles.grandValue}>{formatIDR(invoice.grandTotal)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
