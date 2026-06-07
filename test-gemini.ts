import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  console.log("Key loaded:", !!process.env.GEMINI_API_KEY);

  const systemPrompt = `You are Chrono AI, an intelligent personal time operating system assistant.
Your goal is to break down projects or goals into manageable, scheduled tasks.
The user is in timezone: UTC. Current date: 2026-06-07.

Existing Tasks Context:
None

Instructions:
1. Break the user's prompt into logical subtasks.
2. Estimate reasonable durations.
3. Assign start/end times during typical working hours (09:00 - 18:00) unless requested otherwise.
4. Distribute across upcoming days if it's a large project. Avoid scheduling overlapping tasks if possible.
5. Provide a friendly conversational message explaining the schedule in the \`message\` field. Include bold formatting (using **) for emphasis.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            message: {
              type: SchemaType.STRING,
              description: 'A conversational response explaining the schedule you created.',
            },
            tasks: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  date: { type: SchemaType.STRING, description: 'YYYY-MM-DD' },
                  startTime: { type: SchemaType.STRING, description: 'HH:MM in 24-hour format' },
                  endTime: { type: SchemaType.STRING, description: 'HH:MM in 24-hour format' },
                  priority: { type: SchemaType.STRING, description: 'One of: critical, high, medium, low' },
                },
                required: ['title', 'description', 'date', 'startTime', 'endTime', 'priority'],
              },
            },
          },
          required: ['message', 'tasks'],
        },
      },
    });

    const result = await model.generateContent("Help me study for an exam");
    console.log("Raw Response:");
    console.log(result.response.text());
    
    let responseText = result.response.text();
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    const data = JSON.parse(responseText);
    console.log("Parsed Data:", data);

  } catch (err: any) {
    console.error("ERROR CAUGHT:");
    console.error(err.message);
  }
}

test();
