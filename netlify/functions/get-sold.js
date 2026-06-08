const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
    try {
        const store = getStore('sold-paintings');
        const data = await store.get('list', { type: 'json' });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data || []),
        };
    } catch {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([]),
        };
    }
};
