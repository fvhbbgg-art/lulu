exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    // Convert Anthropic format to Groq format
    const messages = [];
    if (body.system) {
      messages.push({ role: 'system', content: body.system });
    }
    messages.push(...body.messages);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.9
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'آسفة... قلبي معك';

    // Return in Anthropic-compatible format
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        content: [{ type: 'text', text }]
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
