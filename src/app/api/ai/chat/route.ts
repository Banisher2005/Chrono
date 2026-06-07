import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    const { prompt, existingTasks, userTimezone } = await req.json();

    const systemPrompt = `You are Chrono AI, an intelligent personal time operating system assistant.
Your goal is to break down projects or goals into manageable, scheduled tasks.
The user is in timezone: ${userTimezone}. Current date: ${new Date().toISOString().split('T')[0]}.

Existing Tasks Context:
${existingTasks ? JSON.stringify(existingTasks.slice(0, 50)) : 'None'}

Instructions:
2. Estimate reasonable durations and identify times when the user is free.
3. Assign start/end times during typical working hours (09:00 - 18:00) unless requested otherwise.
4. Distribute across upcoming days if it's a large project. Avoid scheduling overlapping tasks.
5. Provide a friendly conversational message explaining the schedule in the \`message\` field.
6. If the user asks to cancel or delete an existing task, include its ID in \`deletedTaskIds\`.
7. If you are moving or updating an existing task, include it in the \`updatedTasks\` array with its ID and the new properties.`;

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
            deletedTaskIds: {
              type: SchemaType.ARRAY,
              description: 'IDs of existing tasks to delete or cancel based on user request.',
              items: { type: SchemaType.STRING },
            },
            updatedTasks: {
              type: SchemaType.ARRAY,
              description: 'Updates to existing tasks (e.g. moving them to a new time).',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.STRING, description: 'ID of the existing task' },
                  title: { type: SchemaType.STRING },
                  date: { type: SchemaType.STRING, description: 'YYYY-MM-DD' },
                  startTime: { type: SchemaType.STRING, description: 'HH:MM in 24-hour format' },
                  endTime: { type: SchemaType.STRING, description: 'HH:MM in 24-hour format' },
                },
                required: ['id'],
              },
            },
          },
          required: ['message'],
        },
      },
    });

    const result = await model.generateContent(prompt);

    let responseText = result.response.text();
    // Strip markdown code block if present
    if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/^\`\`\`(json)?/, '').replace(/\`\`\`$/, '').trim();
    }
    const data = JSON.parse(responseText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
