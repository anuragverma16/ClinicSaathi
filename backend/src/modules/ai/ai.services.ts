import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 1. AI Receptionist / Assistant (WhatsApp & Web Chat)
  async handleIncomingMessage(patientId: string, userMessage: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Aap ClinicSaathi ke AI Receptionist hain. Patients ke questions aur unki queries ka polite answer dein aur appointment booking mein madad karein.`,
        },
        { role: 'user', content: userMessage },
      ],
    });

    return response.choices[0].message.content;
  }

  // 2. AI Follow-up & Recall Engine (Post-Consultation)
  async generateFollowUpMessage(patientName: string, diagnosis: string) {
    const prompt = `Patient ${patientName} ka diagnosis: "${diagnosis}" tha. Unhe care instructions aur 3 din baad ka check-up reminder message WhatsApp ke liye generate karein. Short aur friendly rakhein.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  }

  // 3. AI Review Booster
  async generateReviewRequest(patientName: string) {
    return `Namaste ${patientName} ji! ClinicSaathi par aapka consultation kaisa raha? Humari help ke liye Google par apna review zaroor dein: https://g.page/r/clinic-review`;
  }
}