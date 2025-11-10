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

interface SystemAlertEmailProps {
  alertType: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
  dashboardUrl: string;
}

export const SystemAlertEmail = ({
  alertType,
  severity,
  title,
  message,
  metadata,
  timestamp,
  dashboardUrl,
}: SystemAlertEmailProps) => {
  const severityColors = {
    critical: { bg: "#fee2e2", border: "#dc2626", text: "#991b1b" },
    high: { bg: "#fed7aa", border: "#ea580c", text: "#9a3412" },
    medium: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    low: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  };

  const colors = severityColors[severity] || severityColors.medium;
  const formattedTime = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  return (
    <Html>
      <Head />
      <Preview>System Alert: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...alertBanner, backgroundColor: colors.bg, borderColor: colors.border }}>
            <Text style={{ ...severityBadge, color: colors.text }}>
              {severity.toUpperCase()} ALERT
            </Text>
            <Heading style={{ ...h1, color: colors.text }}>⚠️ {title}</Heading>
          </Section>

          <Section style={messageBox}>
            <Heading style={h2}>Alert Details</Heading>
            <Text style={messageText}>{message}</Text>

            <Hr style={hr} />

            <Row style={detailRow}>
              <Column style={detailLabel}>Alert Type:</Column>
              <Column style={detailValue}>{alertType}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Severity:</Column>
              <Column style={detailValue}>{severity}</Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabel}>Timestamp:</Column>
              <Column style={detailValue}>{formattedTime}</Column>
            </Row>

            {Object.keys(metadata).length > 0 && (
              <>
                <Hr style={hr} />
                <Heading style={h3}>Additional Information</Heading>
                {Object.entries(metadata).map(([key, value]) => (
                  <Row key={key} style={detailRow}>
                    <Column style={detailLabel}>{key}:</Column>
                    <Column style={detailValue}>
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </Column>
                  </Row>
                ))}
              </>
            )}
          </Section>

          <Section style={ctaSection}>
            <Link href={dashboardUrl} style={button}>
              View Admin Dashboard
            </Link>
          </Section>

          <Section style={actionBox}>
            <Text style={actionText}>
              <strong>Recommended Actions:</strong>
            </Text>
            <Text style={actionText}>
              {severity === "critical" && "• Immediate investigation required"}
              {severity === "high" && "• Review and address within 1 hour"}
              {severity === "medium" && "• Review within 24 hours"}
              {severity === "low" && "• Review at your convenience"}
            </Text>
            <Text style={actionText}>
              • Check system logs for additional context
            </Text>
            <Text style={actionText}>
              • Monitor related systems for cascading issues
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This is an automated alert from Red Square monitoring system.
          </Text>
          <Text style={footer}>
            For urgent issues, contact the on-call team immediately.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SystemAlertEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
};

const alertBanner = {
  padding: "32px 20px",
  textAlign: "center" as const,
  borderBottom: "4px solid",
};

const severityBadge = {
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1px",
  margin: "0 0 16px",
};

const h1 = {
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
  padding: "0",
};

const h3 = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "16px 0 12px",
  padding: "0",
};

const messageBox = {
  margin: "20px",
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
};

const messageText = {
  color: "#111827",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const detailRow = {
  marginBottom: "8px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  width: "140px",
  verticalAlign: "top" as const,
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
  wordBreak: "break-word" as const,
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

const actionBox = {
  backgroundColor: "#fffbeb",
  borderLeft: "4px solid #f59e0b",
  margin: "20px",
  padding: "16px 20px",
  borderRadius: "4px",
};

const actionText = {
  color: "#78350f",
  fontSize: "14px",
  margin: "4px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "8px 20px",
  textAlign: "center" as const,
};
