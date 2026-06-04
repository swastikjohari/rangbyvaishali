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

    try {
        // Send via Web3Forms (free email API)
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_KEY,
                subject: `🎨 New Order: ${shipping.name} - ₹${total}`,
                from_name: 'Rang by Vaishali',
                to: process.env.NOTIFICATION_EMAIL,
                message: message,
                // Also send customer a confirmation
                replyto: shipping.email,
            })
        });

        const result = await response.json();

        if (result.success) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: true }),
            };
        } else {
            throw new Error(result.message || 'Email send failed');
        }
    } catch (error) {
        console.error('Send order error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
