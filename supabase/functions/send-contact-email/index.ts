import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const contactData: ContactRequest = await req.json();

    const emailContent = `
New Contact Request from Stream Bridge Services Website

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone || 'Not provided'}
Service Interest: ${contactData.service || 'Not specified'}

Message:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${contactData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This message was sent from the Stream Bridge Services contact form.
Please respond promptly to maintain customer satisfaction.
    `.trim();

    console.log('📧 Email Notification:', {
      to: 'info@streambridgeservices.com',
      subject: `New Contact Request from ${contactData.name}`,
      from: contactData.email,
      timestamp: new Date().toISOString(),
    });

    console.log('Email Content:');
    console.log(emailContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact request received and notification sent',
        emailPreview: emailContent,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing contact request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
