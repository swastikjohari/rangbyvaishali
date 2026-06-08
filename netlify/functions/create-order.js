const Razorpay = require('razorpay');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { amount, currency = 'INR', receipt } = body;
    const amountPaise = Math.round(amount * 100);

    if (!amount || amountPaise < 100) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Amount must be at least ₹1' }) };
    }

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        const order = await razorpay.orders.create({
            amount: amountPaise, // in paise
            currency,
            receipt: receipt || `order_${Date.now()}`,
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
