const Razorpay = require('razorpay');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { amount, currency = 'INR', receipt } = JSON.parse(event.body);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
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
