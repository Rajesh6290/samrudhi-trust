"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

interface Payment {
  _id: string;
  amount: number;
  month: string;
  paymentDate: string;
  status: "pending" | "completed" | "failed";
  invoiceNumber?: string;
  razorpayPaymentId?: string;
}

interface PaymentHistoryProps {
  memberId: string;
}

export default function PaymentHistory({ memberId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/payments", {
        params: { memberId },
      });
      setPayments(response.data.payments);
    } catch (_error) {
      toast.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const downloadInvoice = async (paymentId: string) => {
    try {
      const response = await axios.get(`/api/payments/invoice/${paymentId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Invoice downloaded successfully");
    } catch (_error) {
      toast.error("Failed to download invoice");
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : payments.length === 0 ? (
          <Alert severity="info">No payment history found</Alert>
        ) : (
          <>
            <Box sx={{ mb: 3, p: 2, bgcolor: "#e8f5e9", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                ₹{totalPaid.toLocaleString("en-IN")}
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Invoice No.</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Month</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Payment Date</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>{payment.invoiceNumber || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(payment.month).toLocaleDateString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                                ? "warning"
                                : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.status === "completed" && (
                          <IconButton
                            size="small"
                            onClick={() => downloadInvoice(payment._id)}
                            color="primary"
                          >
                            <Download />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
