const { getStore } = require('@netlify/blobs');

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

    const { paintingId } = body;
    if (!paintingId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'paintingId required' }) };
    }

    try {
        const store = getStore('sold-paintings');
        const current = await store.get('list', { type: 'json' }) || [];
        const updated = current.filter(id => id !== paintingId);
        await store.set('list', JSON.stringify(updated));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
