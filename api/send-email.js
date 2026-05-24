const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'London Axion Inquiries <onboarding@resend.dev>';
const TO_EMAIL = process.env.TO_EMAIL || 'solutions@londonaxion.co.uk';

module.exports = async (req, res) => {
    // 1. Enforce CORS headers & OPTIONS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Enforce POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, email, company, interest, brief } = req.body;

        // 3. Validate required inputs
        if (!name || !email || !brief) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 4. Fallback for optional fields
        const companyText = company ? company : 'Not Specified';
        const interestText = interest ? interest : 'Not Specified';

        if (!RESEND_API_KEY) {
            console.error('RESEND_API_KEY environment variable is not defined.');
            return res.status(500).json({ error: 'Mail server configuration error' });
        }

        // 5. Send email via Resend REST API using fetch
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: TO_EMAIL,
                subject: `New Inquiry: ${name} (${interestText})`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
                        <h2 style="color: #0f172a; border-bottom: 2px solid #adc6ff; padding-bottom: 10px; margin-top: 0;">New Consultation Inquiry</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 140px;">Full Name:</td>
                                <td style="padding: 8px 0; color: #0f172a;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email Address:</td>
                                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Company:</td>
                                <td style="padding: 8px 0; color: #0f172a;">${companyText}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Service Interest:</td>
                                <td style="padding: 8px 0; color: #0f172a;">${interestText}</td>
                            </tr>
                        </table>
                        <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1;">
                            <h4 style="margin-top: 0; color: #475569; margin-bottom: 8px;">Project Brief:</h4>
                            <p style="margin: 0; color: #0f172a; line-height: 1.5; white-space: pre-wrap;">${brief}</p>
                        </div>
                        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                            This email was sent securely via London Axion Serverless API & Resend.
                        </p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API Error:', data);
            return res.status(response.status).json({ error: data.message || 'Error sending email' });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Serverless Function Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
