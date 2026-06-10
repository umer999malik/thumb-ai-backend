export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({
      message: 'Subject API is working. Send a POST request with imageBase64.'
    });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No imageBase64 provided.' });
    }

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_file_b64: imageBase64.split(',')[1],
        size: 'auto'
      })
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      return res.status(removeBgResponse.status).json({
        error: 'Remove.bg failed',
        details: errorText
      });
    }

    const arrayBuffer = await removeBgResponse.arrayBuffer();
    const base64Result = Buffer.from(arrayBuffer).toString('base64');

    return res.status(200).json({
      image: `data:image/png;base64,${base64Result}`
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
