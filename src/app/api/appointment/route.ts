import { NextRequest, NextResponse } from "next/server";

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "";
const CLINIC_WHATSAPP = process.env.CLINIC_WHATSAPP_NUMBER || "whatsapp:+916381871589";
const CLINIC_EMAIL = process.env.CLINIC_EMAIL || "";

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

const isResendConfigured = RESEND_API_KEY.length > 0 && !RESEND_API_KEY.includes("YOUR_");

const isWhatsappConfigured =
  TWILIO_ACCOUNT_SID.length > 0 && !TWILIO_ACCOUNT_SID.includes("YOUR_") &&
  TWILIO_AUTH_TOKEN.length > 0 && !TWILIO_AUTH_TOKEN.includes("YOUR_") &&
  TWILIO_WHATSAPP_NUMBER.length > 0 && !TWILIO_WHATSAPP_NUMBER.includes("YOUR_");

// Doctor notification via EmailJS (already working)
async function sendDoctorEmail(body: AppointmentBody): Promise<boolean> {
  if (!isEmailConfigured || !CLINIC_EMAIL) return false;
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: CLINIC_EMAIL,
          from_name: body.name,
          from_phone: body.phone,
          from_email: body.email,
          service: body.service,
          preferred_date: body.preferredDate || "Not specified",
          message: body.message || "No additional notes",
        },
      }),
    });
    if (!res.ok) console.error("[EmailJS/Doctor] Failed:", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[EmailJS/Doctor] Error:", err);
    return false;
  }
}

// Patient notification via Resend (bulletproof deliverability)
async function sendPatientEmail(body: AppointmentBody): Promise<boolean> {
  if (!isResendConfigured) return false;
  try {
    const html = `
      <div style="max-width:480px;margin:0 auto;font-family:'Segoe UI',system-ui,sans-serif;color:#1e293b">
        <div style="text-align:center;padding:32px 0 16px">
          <img src="https://brightsmile-dental-two.vercel.app/dental-logo.png" alt="BrightSmile Dental" style="width:48px;height:48px;border-radius:50%" />
          <h1 style="margin:12px 0 4px;font-size:22px;font-weight:700;color:#0f172a">Appointment Request Received!</h1>
          <p style="margin:0;color:#64748b;font-size:14px">We'll contact you shortly to confirm</p>
        </div>
        <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#64748b;font-weight:500;width:100px">Service</td>
              <td style="padding:8px 0;font-weight:600">${body.service}</td>
            </tr>
            ${body.preferredDate ? `
            <tr>
              <td style="padding:8px 0;color:#64748b;font-weight:500">Preferred Date</td>
              <td style="padding:8px 0;font-weight:600">${body.preferredDate}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0;color:#64748b;font-weight:500">Phone</td>
              <td style="padding:8px 0;font-weight:600">${body.phone}</td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;padding:16px 0 32px">
          <p style="font-size:13px;color:#94a3b8;margin:0 0 8px">For urgent queries, call us at</p>
          <a href="tel:+916381871589" style="font-size:16px;font-weight:700;color:#0284c7;text-decoration:none">+91 63818 71589</a>
          <p style="font-size:12px;color:#cbd5e1;margin:20px 0 0">BrightSmile Dental &mdash; Your smile, our priority.</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BrightSmile Dental <onboarding@resend.dev>",
        to: body.email,
        subject: "Appointment Confirmed - " + body.service + " | BrightSmile Dental",
        html: html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[Resend/Patient] Failed:", res.status, errText);
    }
    return res.ok;
  } catch (err) {
    console.error("[Resend/Patient] Error:", err);
    return false;
  }
}

async function sendWhatsapp(body: AppointmentBody): Promise<{ clinicSent: boolean; patientSent: boolean }> {
  if (!isWhatsappConfigured) return { clinicSent: false, patientSent: false };
  try {
    const encoded = Buffer.from(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN).toString("base64");

    const clinicMsg =
      "\u{1F9B7} *BrightSmile Dental \u2014 New Appointment*\n\n" +
      "*Patient:* " + body.name + "\n" +
      "*Service:* " + body.service + "\n" +
      "*Phone:* " + body.phone + "\n" +
      "*Email:* " + body.email + "\n" +
      (body.preferredDate ? "*Date:* " + body.preferredDate + "\n" : "") +
      (body.message ? "*Notes:* " + body.message : "");

    const patientMsg =
      "Hi " + body.name + "! \u{1F44B}\n\n" +
      "Thank you for choosing *BrightSmile Dental*! \u{1F9B7}\n\n" +
      "We've received your appointment request:\n" +
      "\u2022 *Service:* " + body.service + "\n" +
      (body.preferredDate ? "\u2022 *Preferred Date:* " + body.preferredDate + "\n" : "") +
      "\nOur team will contact you shortly to confirm.\n" +
      "For urgent queries, call us at +91 63818 71589.\n\n" +
      "\u2014 BrightSmile Dental Team \u2764\uFE0F";

    const digits = body.phone.replace(/[^0-9]/g, "");
    const patientWhatsapp = "whatsapp:+" + digits;

    const [clinicRes, patientRes] = await Promise.all([
      fetch(
        "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json",
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + encoded,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: [
            "To=" + encodeURIComponent(CLINIC_WHATSAPP),
            "From=" + encodeURIComponent(TWILIO_WHATSAPP_NUMBER),
            "Body=" + encodeURIComponent(clinicMsg),
          ].join("&"),
        }
      ),
      fetch(
        "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json",
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + encoded,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: [
            "To=" + encodeURIComponent(patientWhatsapp),
            "From=" + encodeURIComponent(TWILIO_WHATSAPP_NUMBER),
            "Body=" + encodeURIComponent(patientMsg),
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

    // Send all notifications in parallel
    const [doctorEmailSent, patientEmailSent, whatsappResult] = await Promise.all([
      sendDoctorEmail(body),
      sendPatientEmail(body),
      sendWhatsapp(body),
    ]);

    // Try to save to database (optional — dynamic import, never crashes)
    let dbSaved = false;
    try {
      const { db } = await import("@/lib/db");
      await db.appointment.create({
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
    } catch (dbErr) {
      console.error("[DB] Save skipped (non-critical):", dbErr);
    }

    return NextResponse.json({
      success: true,
      emailSentToDoctor: doctorEmailSent,
      emailSentToPatient: patientEmailSent,
      whatsappSentToClinic: whatsappResult.clinicSent,
      whatsappSentToPatient: whatsappResult.patientSent,
      dbSaved,
      emailConfigured: isEmailConfigured,
      resendConfigured: isResendConfigured,
      whatsappConfigured: isWhatsappConfigured,
    });
  } catch (err) {
    console.error("[Appointment] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
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
