import { NextRequest, NextResponse } from "next/server";

// ─── Config (all optional — nothing crashes if missing) ───
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "";
const CLINIC_WHATSAPP = process.env.CLINIC_WHATSAPP_NUMBER || "";
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

// ─── 1. Doctor Email via EmailJS (WORKING - do not change) ───
async function sendDoctorEmail(body: AppointmentBody): Promise<boolean> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !CLINIC_EMAIL) return false;
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
    if (!res.ok) console.error("[DoctorEmail] EmailJS failed:", res.status);
    return res.ok;
  } catch (err) {
    console.error("[DoctorEmail] Error:", err);
    return false;
  }
}

// ─── 2. Patient Email via Resend (bulletproof) ───
async function sendPatientEmail(body: AppointmentBody): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9">
<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 24px;text-align:center">
    <div style="font-size:28px;margin-bottom:8px">🦷</div>
    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Appointment Received!</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">We will contact you shortly to confirm</p>
  </div>
  <div style="padding:24px">
    <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:16px">
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Service</p>
      <p style="margin:0 0 16px;color:#0f172a;font-size:16px;font-weight:700">${body.service}</p>
      ${body.preferredDate ? `
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Preferred Date</p>
      <p style="margin:0 0 16px;color:#0f172a;font-size:16px;font-weight:700">${body.preferredDate}</p>
      ` : ""}
      <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Patient</p>
      <p style="margin:0;color:#0f172a;font-size:16px;font-weight:700">${body.name}</p>
    </div>
    <div style="text-align:center;padding-top:8px;border-top:1px solid #e2e8f0">
      <p style="margin:0 0 4px;color:#64748b;font-size:13px">For urgent queries, call us</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#0284c7">+91 63818 71589</p>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:12px;color:#94a3b8">BrightSmile Dental &mdash; Your smile, our priority.</p>
  </div>
</div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BrightSmile Dental <onboarding@resend.dev>",
        to: [body.email],
        subject: "Appointment Confirmed - " + body.service + " | BrightSmile Dental",
        html: html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[PatientEmail] Resend failed:", res.status, errBody);
      return false;
    }

    const data = await res.json();
    console.log("[PatientEmail] Sent successfully, ID:", data.id);
    return true;
  } catch (err) {
    console.error("[PatientEmail] Error:", err);
    return false;
  }
}

// ─── 3. WhatsApp via Twilio (requires Business API for production) ───
async function sendWhatsapp(body: AppointmentBody): Promise<{ clinic: boolean; patient: boolean }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return { clinic: false, patient: false };
  }
  try {
    const auth = Buffer.from(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN).toString("base64");
    const clinicMsg =
      "🦷 *BrightSmile Dental - New Appointment*\n\n" +
      "*Patient:* " + body.name + "\n" +
      "*Service:* " + body.service + "\n" +
      "*Phone:* " + body.phone + "\n" +
      "*Email:* " + body.email + "\n" +
      (body.preferredDate ? "*Date:* " + body.preferredDate + "\n" : "") +
      (body.message ? "*Notes:* " + body.message : "");

    const digits = body.phone.replace(/[^0-9]/g, "");
    const patientNumber = "whatsapp:+" + digits;

    const sendOne = (to: string, msg: string) =>
      fetch("https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json", {
        method: "POST",
        headers: { Authorization: "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: [
          "To=" + encodeURIComponent(to),
          "From=" + encodeURIComponent(TWILIO_WHATSAPP_NUMBER),
          "Body=" + encodeURIComponent(msg),
        ].join("&"),
      });

    const [clinicRes, patientRes] = await Promise.all([
      CLINIC_WHATSAPP ? sendOne(CLINIC_WHATSAPP, clinicMsg) : Promise.resolve({ ok: false }),
      sendOne(patientNumber, clinicMsg),
    ]);

    if (!clinicRes.ok) console.error("[WhatsApp/Clinic] Failed:", clinicRes.status);
    if (!patientRes.ok) console.error("[WhatsApp/Patient] Failed:", patientRes.status);

    return { clinic: clinicRes.ok, patient: patientRes.ok };
  } catch (err) {
    console.error("[WhatsApp] Error:", err);
    return { clinic: false, patient: false };
  }
}

// ─── Main POST handler ───
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Step 1: Send Doctor Email (EmailJS - already working)
    const doctorOk = await sendDoctorEmail(body);

    // Step 2: Send Patient Email (Resend)
    const patientOk = await sendPatientEmail(body);

    // Step 3: Send WhatsApp (Twilio - may fail in sandbox, that is OK)
    const whatsappOk = await sendWhatsapp(body);

    // Step 4: Try to save to DB (optional, fails silently on Vercel)
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

    // ALWAYS return success - notifications are best-effort
    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully!",
      doctorEmailSent: doctorOk,
      patientEmailSent: patientOk,
      whatsappSent: whatsappOk,
      dbSaved: dbSaved,
    });
  } catch (err) {
    console.error("[Appointment] Fatal error:", err);
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