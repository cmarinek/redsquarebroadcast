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

interface ScreenOwnerNotificationEmailProps {
  screenName: string;
  ownerName: string;
  bookingId: string;
  startTime: string;
  endTime: string;
  duration: number;
  earnings: number;
  currency: string;
  dashboardUrl: string;
}

export const ScreenOwnerNotificationEmail = ({
  screenName,
  ownerName,
  bookingId,
  startTime,
  endTime,
  duration,
  earnings,
  currency,
  dashboardUrl,
}: ScreenOwnerNotificationEmailProps) => {
  const formattedStartTime = new Date(startTime).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Html>
      <Head />
      <Preview>New booking received for {screenName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💰 New Booking Received!</Heading>
          <Text style={text}>Hi {ownerName},</Text>
          <Text style={text}>
            Great news! Your screen <strong>{screenName}</strong> has received a
            new booking.
          </Text>

          <Section style={earningsBox}>
            <Text style={earningsLabel}>Your Earnings</Text>
            <Text style={earningsAmount}>
              {currency.toUpperCase()} {earnings.toFixed(2)}
            </Text>
          </Section>

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
              <Column style={detailLabel}>Start Time:</Column>
              <Column style={detailValue}>{formattedStartTime}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Duration:</Column>
              <Column style={detailValue}>{duration} minutes</Column>
            </Row>
          </Section>

          <Section style={ctaSection}>
            <Link href={dashboardUrl} style={button}>
              View in Dashboard
            </Link>
          </Section>

          <Text style={text}>
            You can review the booking details, approve the content, and track
            your earnings in your screen owner dashboard.
          </Text>

          <Section style={tipBox}>
            <Text style={tipText}>
              💡 <strong>Tip:</strong> Keep your screen online and available to
              maximize your earnings. Consider adjusting your pricing during
              peak hours!
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Visit our{" "}
            <Link href="https://redsquare.app/support" style={link}>
              Help Center
            </Link>{" "}
            or email{" "}
            <Link href="mailto:support@redsquare.app" style={link}>
              support@redsquare.app
            </Link>
          </Text>
          <Text style={footer}>
            Red Square - Empowering Screen Owners Worldwide
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ScreenOwnerNotificationEmail;

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

const earningsBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  margin: "20px",
  padding: "24px",
  textAlign: "center" as const,
  border: "2px solid #16a34a",
};

const earningsLabel = {
  color: "#15803d",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const earningsAmount = {
  color: "#16a34a",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "0",
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
  width: "120px",
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

const tipBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  margin: "20px",
  padding: "16px 20px",
  borderRadius: "4px",
};

const tipText = {
  color: "#1e40af",
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
