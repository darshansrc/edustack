import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

sgMail.setApiKey(
  "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"
);

export async function POST(request: NextRequest) {
  const res = await request.json();

  const { to, from, subject, text, attachment } = res;

  const msg = {
    to,
    from,
    subject,
    text,
    attachments: [
      {
        content: attachment,
        filename: "report.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent");
    return NextResponse.json(
      { message: "message sent successfully ! " },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
    return NextResponse.json(
      { message: "failed to send email " },
      { status: 500 }
    );
  }
}
