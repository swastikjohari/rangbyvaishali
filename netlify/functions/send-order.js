const { Resend } = require('resend');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { shipping, items, total, paymentId } = JSON.parse(event.body);

    const itemsList = items.map(item => `${item.name} — ${item.price}`).join('<br>');

    const html = `
        <h2>🎨 New Order — Rang by Vaishali</h2>
        <h3>Customer</h3>
        <p><b>Name:</b> ${shipping.name}<br>
        <b>Phone:</b> ${shipping.phone}<br>
        <b>Email:</b> ${shipping.email}</p>
        <h3>Shipping Address</h3>
        <p>${shipping.address}<br>${shipping.city}, ${shipping.state} — ${shipping.pincode}</p>
        <h3>Items Ordered</h3>
        <p>${itemsList}</p>
        <h3>Payment</h3>
        <p><b>Total Paid:</b> ₹${total}<br>
        <b>Payment ID:</b> ${paymentId}</p>
        <p style="color:green">✅ Payment confirmed via Razorpay</p>
    `;

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
            from: 'Rang by Vaishali <orders@rangbyvaishali.in>',
            to: process.env.NOTIFICATION_EMAIL,
            subject: `🎨 New Order: ${shipping.name} — ₹${total}`,
            html,
        });

        if (error) {
            console.error('Resend error:', JSON.stringify(error));
            return { statusCode: 500, body: JSON.stringify({ error }) };
        }

        console.log('Email sent successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (err) {
        console.error('Send order error:', err.message);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
