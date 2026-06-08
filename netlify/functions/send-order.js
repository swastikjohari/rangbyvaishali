exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { shipping, items, total, paymentId } = JSON.parse(event.body);

    const itemsList = items.map(item => `• ${item.name} - ${item.price}`).join('\n');

    const message = `🎨 NEW ORDER - Rang by Vaishali\n\n` +
        `Customer: ${shipping.name}\n` +
        `Phone: ${shipping.phone}\n` +
        `Email: ${shipping.email}\n\n` +
        `Shipping Address:\n${shipping.address}\n${shipping.city}, ${shipping.state} - ${shipping.pincode}\n\n` +
        `Items Ordered:\n${itemsList}\n\n` +
        `Total Paid: ₹${total}\n` +
        `Payment ID: ${paymentId}\n\n` +
        `✅ Payment confirmed via Razorpay`;

    const results = await Promise.allSettled([
        sendEmail(shipping, message, total),
        sendWhatsApp(message),
    ]);

    const emailOk = results[0].status === 'fulfilled' && results[0].value;
    const waOk = results[1].status === 'fulfilled' && results[1].value;

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOk, whatsapp: waOk }),
    };
};

async function sendEmail(shipping, message, total) {
    if (!process.env.WEB3FORMS_KEY) return false;
    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_KEY,
                subject: `🎨 New Order: ${shipping.name} - ₹${total}`,
                from_name: 'Rang by Vaishali',
                to: process.env.NOTIFICATION_EMAIL,
                message,
                replyto: shipping.email,
            }),
        });
        const data = await res.json();
        console.log('Web3Forms response:', JSON.stringify(data));
        return data.success === true;
    } catch (err) {
        console.error('Web3Forms error:', err.message);
        return false;
    }
}

async function sendWhatsApp(message) {
    const apiKey = process.env.CALLMEBOT_APIKEY;
    const phone = '918433192711';
    if (!apiKey) return false;
    try {
        const encoded = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;
        const res = await fetch(url);
        return res.ok;
    } catch {
        return false;
    }
}
