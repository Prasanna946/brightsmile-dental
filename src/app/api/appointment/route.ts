import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!validateBody(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields (name, phone, email, service)." },
        { status: 400 }
      );
    }

    // 1. Save to database
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

    // 2. Send email via EmailJS (if configured)
    let emailSent = false;
    const isConfigured =
      EMAILJS_PUBLIC_KEY.length > 0 &&
      !EMAILJS_PUBLIC_KEY.includes("YOUR_") &&
      EMAILJS_SERVICE_ID.length > 0 &&
      !EMAILJS_SERVICE_ID.includes("YOUR_") &&
      EMAILJS_TEMPLATE_ID.length > 0 &&
      !EMAILJS_TEMPLATE_ID.includes("YOUR_");

    if (isConfigured) {
      try {
        // Call EmailJS REST API directly from the server
        const emailParams = {
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
        };

        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailParams),
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.error("[EmailJS] Failed:", res.status, errBody);
        }

        emailSent = res.ok;
      } catch {
        // Email failed but appointment is still saved
      }
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        name: appointment.name,
        service: appointment.service,
        createdAt: appointment.createdAt,
      },
      emailSent,
      emailConfigured: isConfigured,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Optional: list recent appointments (for clinic staff)
export async function GET() {
  const appointments = await db.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ appointments });
}
