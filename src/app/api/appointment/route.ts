import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || ""; // e.g. whatsapp:+14155238886
const CLINIC_WHATSAPP = process.env.CLINIC_WHATSAPP_NUMBER || "whatsapp:+916381871589";

interface AppointmentBody {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate?: string;
  message?: string;
}

function validateBody(body: unknown): body is AppointmentBody {
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" && b.name.trim().length > 0 &&
    typeof b.phone === "string" && b.phone.trim().length > 0 &&
    typeof b.email === "string" && b.email.trim().length > 0 &&
    typeof b.service === "string" && b.service.trim().length > 0
  );
}

const isEmailConfigured =
  EMAILJS_PUBLIC_KEY.length > 0 && !EMAILJS_PUBLIC_KEY.includes("YOUR_") &&
  EMAILJS_SERVICE_ID.length > 0 && !EMAILJS_SERVICE_ID.includes("YOUR_") &&
  EMAILJS_TEMPLATE_ID.length > 0 && !EMAILJS_TEMPLATE_ID.includes("YOUR_");

const isWhatsappConfigured =
  TWILIO_ACCOUNT_SID.length > 0 && !TWILIO_ACCOUNT_SID.includes("YOUR_") &&
  TWILIO_AUTH_TOKEN.length > 0 && !TWILIO_AUTH_TOKEN.includes("YOUR_") &&
  TWILIO_WHATSAPP_NUMBER.length > 0 && !TWILIO_WHATSAPP_NUMBER.includes("YOUR_");

async function sendEmail(body: AppointmentBody): Promise<boolean> {
  if (!isEmailConfigured) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name: body.name,
          from_phone: body.phone,
          from_email: body.email,
          service: body.service,
          preferred_date: body.preferredDate || "Not specified",
          message: body.message || "No additional notes",
        },
      }),
    });
    if (!res.ok) {
      console.error("[EmailJS] Failed:", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("[EmailJS] Error:", err);
    return false;
  }
}

async function sendWhatsapp(body: AppointmentBody): Promise<{ clinicSent: boolean; patientSent: boolean }> {
  if (!isWhatsappConfigured) return { clinicSent: false, patientSent: false };
  try {
    const encoded = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    // Message to clinic (detailed)
    const clinicMsg =
      `🦷 *BrightSmile Dental — New Appointment*\n\n` +
      `*Patient:* ${body.name}\n` +
      `*Service:* ${body.service}\n` +
      `*Phone:* ${body.phone}\n` +
      `*Email:* ${body.email}\n` +
      (body.preferredDate ? `*Date:* ${body.preferredDate}\n` : "") +
      (body.message ? `*Notes:* ${body.message}` : "");

    // Message to patient (friendly confirmation)
    const patientMsg =
      `Hi ${body.name}! 👋\n\n` +
      `Thank you for choosing *BrightSmile Dental*! 🦷\n\n` +
      `We've received your appointment request:\n` +
      `• *Service:* ${body.service}\n` +
      (body.preferredDate ? `• *Preferred Date:* ${body.preferredDate}\n` : "") +
      `\nOur team will contact you shortly to confirm.\n` +
      `For urgent queries, call us at +91 63818 71589.\n\n` +
      `— BrightSmile Dental Team ❤️`;

    // Build patient WhatsApp number from the phone field
    const digits = body.phone.replace(/[^0-9]/g, "");
    const patientWhatsapp = `whatsapp:+${digits}`;

    const [clinicRes, patientRes] = await Promise.all([
      fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encoded}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: [
            `To=${encodeURIComponent(CLINIC_WHATSAPP)}`,
            `From=${encodeURIComponent(TWILIO_WHATSAPP_NUMBER)}`,
            `Body=${encodeURIComponent(clinicMsg)}`,
          ].join("&"),
        }
      ),
      fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encoded}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: [
            `To=${encodeURIComponent(patientWhatsapp)}`,
            `From=${encodeURIComponent(TWILIO_WHATSAPP_NUMBER)}`,
            `Body=${encodeURIComponent(patientMsg)}`,
          ].join("&"),
        }
      ),
    ]);

    if (!clinicRes.ok) console.error("[WhatsApp/Clinic] Failed:", clinicRes.status, await clinicRes.text());
    if (!patientRes.ok) console.error("[WhatsApp/Patient] Failed:", patientRes.status, await patientRes.text());

    return { clinicSent: clinicRes.ok, patientSent: patientRes.ok };
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    return { clinicSent: false, patientSent: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields (name, phone, email, service)." },
        { status: 400 }
      );
    }

    // 1. ALWAYS send email + WhatsApp first (these are critical for the clinic)
    const [emailSent, whatsappResult] = await Promise.all([
      sendEmail(body),
      sendWhatsapp(body),
    ]);

    // 2. Try to save to database (optional — fails silently on Vercel read-only filesystem)
    let dbSaved = false;
    try {
      const appointment = await db.appointment.create({
        data: {
          name: body.name.trim(),
          phone: body.phone.trim(),
          email: body.email.trim(),
          service: body.service.trim(),
          preferredDate: body.preferredDate?.trim() || null,
          message: body.message?.trim() || null,
        },
      });
      dbSaved = true;
      return NextResponse.json({
        success: true,
        appointment: {
          id: appointment.id,
          name: appointment.name,
          service: appointment.service,
          createdAt: appointment.createdAt,
        },
        emailSent,
        whatsappSentToClinic: whatsappResult.clinicSent,
        whatsappSentToPatient: whatsappResult.patientSent,
        dbSaved: true,
        emailConfigured: isEmailConfigured,
        whatsappConfigured: isWhatsappConfigured,
      });
    } catch (dbErr) {
      console.error("[DB] Save failed (non-critical):", dbErr);
    }

    // 3. Return success even if DB failed — email/WhatsApp already sent
    return NextResponse.json({
      success: true,
      emailSent,
      whatsappSentToClinic: whatsappResult.clinicSent,
      whatsappSentToPatient: whatsappResult.patientSent,
      dbSaved: false,
      emailConfigured: isEmailConfigured,
      whatsappConfigured: isWhatsappConfigured,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// List recent appointments (for clinic staff)
export async function GET() {
  try {
    const appointments = await db.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("[DB] List failed:", err);
    return NextResponse.json({ appointments: [], dbError: true });
  }
}
