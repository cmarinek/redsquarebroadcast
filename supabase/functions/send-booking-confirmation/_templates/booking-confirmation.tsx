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

interface BookingConfirmationEmailProps {
  bookingId: string;
  screenName: string;
  screenLocation: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: number;
  currency: string;
  userName: string;
  confirmationUrl: string;
}

export const BookingConfirmationEmail = ({
  bookingId,
  screenName,
  screenLocation,
  startTime,
  endTime,
  duration,
  totalAmount,
  currency,
  userName,
  confirmationUrl,
}: BookingConfirmationEmailProps) => {
  const formattedStartTime = new Date(startTime).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const formattedEndTime = new Date(endTime).toLocaleString("en-US", {
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview>Your Red Square booking is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Booking Confirmed!</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Great news! Your booking on Red Square has been confirmed and your
            content is scheduled to broadcast.
          </Text>

          <Section style={bookingDetails}>
            <Heading style={h2}>Booking Details</Heading>
            <Row style={detailRow}>
              <Column style={detailLabel}>Booking ID:</Column>
              <Column style={detailValue}>{bookingId}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Screen:</Column>
              <Column style={detailValue}>{screenName}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Location:</Column>
              <Column style={detailValue}>{screenLocation}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Start Time:</Column>
              <Column style={detailValue}>{formattedStartTime}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>End Time:</Column>
              <Column style={detailValue}>{formattedEndTime}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Duration:</Column>
              <Column style={detailValue}>{duration} minutes</Column>
            </Row>
            <Hr style={hr} />
            <Row style={detailRow}>
              <Column style={detailLabel}>Total Paid:</Column>
              <Column style={{ ...detailValue, fontWeight: "bold" }}>
                {currency.toUpperCase()} {totalAmount.toFixed(2)}
              </Column>
            </Row>
          </Section>

          <Section style={ctaSection}>
            <Link href={confirmationUrl} style={button}>
              View Booking Details
            </Link>
          </Section>

          <Text style={text}>
            You can manage your booking, check broadcast status, and view
            analytics in your{" "}
            <Link href="https://redsquare.app/dashboard" style={link}>
              dashboard
            </Link>
            .
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Contact us at{" "}
            <Link href="mailto:support@redsquare.app" style={link}>
              support@redsquare.app
            </Link>
          </Text>
          <Text style={footer}>
            Red Square - Democratizing Screen Advertising
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

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
  color: "#333",
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

const bookingDetails = {
  backgroundColor: "#f9fafb",
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
  backgroundColor: "#dc2626",
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
