import type { InvoiceDto } from '@lattiz/api-client';
import { FileTextIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInvoices } from '../hooks/useInvoices';

function formatInvoiceDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function PdfButton({ href }: { href: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      render={<a href={href} target="_blank" rel="noreferrer" />}
    >
      <FileTextIcon className="mr-1 size-3.5" />
      PDF
    </Button>
  );
}

function InvoiceTableRow({ invoice }: { invoice: InvoiceDto }) {
  return (
    <TableRow>
      <TableCell>{formatInvoiceDate(invoice.date)}</TableCell>
      <TableCell>{invoice.description ?? '—'}</TableCell>
      <TableCell>{formatAmount(invoice.amountPaid, invoice.currency)}</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className="bg-green-500/10 text-green-700 dark:text-green-400"
        >
          Pagado
        </Badge>
      </TableCell>
      <TableCell>
        {invoice.invoicePdf && <PdfButton href={invoice.invoicePdf} />}
      </TableCell>
    </TableRow>
  );
}

function InvoiceCard({ invoice }: { invoice: InvoiceDto }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{formatInvoiceDate(invoice.date)}</span>
        <Badge
          variant="secondary"
          className="bg-green-500/10 text-green-700 dark:text-green-400"
        >
          Pagado
        </Badge>
      </div>
      <p className="text-muted-foreground">{invoice.description ?? '—'}</p>
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {formatAmount(invoice.amountPaid, invoice.currency)}
        </span>
        {invoice.invoicePdf && <PdfButton href={invoice.invoicePdf} />}
      </div>
    </div>
  );
}

export function PaymentHistorySection() {
  const { data, isLoading, isError } = useInvoices();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de pagos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        )}

        {!isLoading && isError && (
          <p className="text-sm text-destructive">
            No se pudo cargar el historial. Intenta de nuevo.
          </p>
        )}

        {!isLoading && !isError && data?.invoices.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aún no tienes pagos registrados.
          </p>
        )}

        {!isLoading && !isError && data && data.invoices.length > 0 && (
          <>
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Comprobante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((invoice) => (
                  <InvoiceTableRow key={invoice.id} invoice={invoice} />
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-2 md:hidden">
              {data.invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Los comprobantes de Stripe son recibos de pago. Si necesitas una
          factura fiscal (CFDI), escríbenos a soporte@lattiz.mx.
        </p>
      </CardContent>
    </Card>
  );
}
