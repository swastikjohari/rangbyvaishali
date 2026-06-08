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

    const { paintingIds } = body;
    if (!Array.isArray(paintingIds) || paintingIds.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'paintingIds required' }) };
    }

    try {
        const store = getStore('sold-paintings');
        const current = await store.get('list', { type: 'json' }) || [];
        const updated = [...new Set([...current, ...paintingIds])];
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
