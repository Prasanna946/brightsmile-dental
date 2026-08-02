import { NextRequest, NextResponse } from "next/server";

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";
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

// ─── Send email via EmailJS to any recipient ───
async function sendEmailJS(toEmail: string, body: AppointmentBody): Promise<{ ok: boolean; error: string }> {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
    return { ok: false, error: "Missing EmailJS config" };
  }
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: toEmail,
          from_name: body.name,
          from_phone: body.phone,
          from_email: body.email,
          service: body.service,
          preferred_date: body.preferredDate || "Not specified",
          message: body.message || "No additional notes",
        },
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: "EmailJS " + res.status + ": " + text };
    }
    return { ok: true, error: "" };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ─── WhatsApp via Twilio ───
async function sendWhatsapp(body: AppointmentBody): Promise<{ clinic: boolean; patient: boolean }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
    return { clinic: false, patient: false };
  }
  try {
    const auth = Buffer.from(TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN).toString("base64");
    const clinicMsg =
      "*BrightSmile Dental - New Appointment*\n\n" +
      "*Patient:* " + body.name + "\n" +
      "*Service:* " + body.service + "\n" +
      "*Phone:* " + body.phone + "\n" +
      "*Email:* " + body.email +
      (body.preferredDate ? "\n*Date:* " + body.preferredDate : "") +
      (body.message ? "\n*Notes:* " + body.message : "");

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

    return { clinic: clinicRes.ok, patient: patientRes.ok };
  } catch (err) {
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

    // Send Doctor Email via EmailJS
    const doctorResult = await sendEmailJS(CLINIC_EMAIL, body);

    // Send Patient Email via EmailJS (same service, different recipient)
    const patientResult = await sendEmailJS(body.email, body);

    // Send WhatsApp (may fail in sandbox, that is OK)
    const whatsappResult = await sendWhatsapp(body);

    // Try to save to DB (optional, fails silently on Vercel)
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
      console.error("[DB] Save skipped:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully!",
      doctorEmailSent: doctorResult.ok,
      patientEmailSent: patientResult.ok,
      whatsappSent: whatsappResult,
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
