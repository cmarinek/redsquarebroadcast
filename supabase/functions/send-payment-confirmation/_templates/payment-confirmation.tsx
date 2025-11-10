import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface PaymentConfirmationEmailProps {
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  bookingId: string;
  screenName: string;
  receiptUrl: string;
}

export const PaymentConfirmationEmail = ({
  paymentId,
  amount,
  currency,
  paymentMethod,
  transactionId,
  bookingId,
  screenName,
  receiptUrl,
}: PaymentConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment received for your Red Square booking</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✓ Payment Received</Heading>
          <Text style={text}>
            Thank you! Your payment has been successfully processed.
          </Text>

          <Section style={paymentDetails}>
            <Heading style={h2}>Payment Summary</Heading>
            <Row style={detailRow}>
              <Column style={detailLabel}>Amount Paid:</Column>
              <Column style={{ ...detailValue, fontWeight: "bold", fontSize: "18px" }}>
                {currency.toUpperCase()} {amount.toFixed(2)}
              </Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Payment Method:</Column>
              <Column style={detailValue}>{paymentMethod}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Transaction ID:</Column>
              <Column style={detailValue}>{transactionId}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Booking ID:</Column>
              <Column style={detailValue}>{bookingId}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Screen:</Column>
              <Column style={detailValue}>{screenName}</Column>
            </Row>
          </Section>

          <Section style={ctaSection}>
            <Link href={receiptUrl} style={button}>
              Download Receipt
            </Link>
          </Section>

          <Text style={text}>
            Your content is now scheduled to broadcast. You can track your
            booking status in your{" "}
            <Link href="https://redsquare.app/dashboard" style={link}>
              dashboard
            </Link>
            .
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              💡 <strong>Pro Tip:</strong> Monitor your campaign performance in
              real-time through our analytics dashboard.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Need help? Contact{" "}
            <Link href="mailto:support@redsquare.app" style={link}>
              support@redsquare.app
            </Link>
          </Text>
          <Text style={footer}>Red Square © 2025. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#16a34a",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 20px 20px",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 15px",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 20px 20px",
};

const paymentDetails = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #86efac",
  borderRadius: "8px",
  margin: "20px",
  padding: "20px",
};

const detailRow = {
  marginBottom: "12px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  width: "140px",
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
};

const ctaSection = {
  margin: "32px 20px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const link = {
  color: "#dc2626",
  textDecoration: "underline",
};

const infoBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  margin: "20px",
  padding: "16px 20px",
  borderRadius: "4px",
};

const infoText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "24px",
  margin: "0 20px",
  textAlign: "center" as const,
};
