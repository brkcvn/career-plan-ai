'use server';

import { OpenAI } from 'openai';
import { FormData } from '@/types';

export async function askOpenAI(personalInformation: FormData) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "The user is looking to make a career change. Your job is to find the 3 most suitable career opportunities for the user based on the information you received."
                },
                {
                    role: "user",
                    content: `
                        User personal information: ${JSON.stringify(personalInformation)}
                        
                        Based on the information provided, return exactly 3 career suggestions.
                        
                        Format your response as a valid JSON object with a field called "resultInformations" containing an array of career objects. Each career object should have the following structure:
                        {
                            "title": "Career Title",
                            "match": 92, // A number between 0-100 indicating match percentage
                            "description": "Career description",
                            "color": "#00FF00" // A hex color code representing suitability (green for high match, yellow for medium, red for low)
                        }

                        Let the maximum match be 95 percent, the second highest match be 85 percent, and the last highest be 75 percent.
                        
                        If you cannot find suitable careers based on currentCareer: "${personalInformation.currentCareer}" and motivations: "${personalInformation.motivations}", return a JSON object with an "error" field containing your message.
                        
                        Return ONLY the JSON object, with no additional text.
                    `
                }
            ],
            max_tokens: 1000,
        });

        const result = response.choices[0].message.content;
        console.log('OpenAI response:', result);

        if (!result) {
            throw new Error('Response message is null or undefined');
        }

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw new Error(error instanceof Error ? error.message : 'OpenAI API request failed');
    }
}
